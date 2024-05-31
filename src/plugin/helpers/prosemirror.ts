import type { Node, Schema } from "prosemirror-model";
import { DOMParser, DOMSerializer } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import { AllSelection, NodeSelection, TextSelection } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { Decoration, DecorationSet } from "prosemirror-view";
import { anyDescendantFieldIsNestedElementField } from "../fieldViews/NestedElementFieldView";

type NodesBetweenArgs = [Node, number, Node | null, number];
export type Commands = ReturnType<typeof buildCommands>;

const nodesBetween = (state: EditorState, _from: number, _to: number) => {
  const dir = _to - _from;
  const range = [_from, _to];
  range.sort((a, b) => a - b);
  const [from, to] = range;
  const arr: NodesBetweenArgs[] = [];
  state.doc.nodesBetween(from, to, (node, pos, parent, index) => {
    arr.push([node, pos, parent, index]);
    /*
      Returning false from state.doc.nodesBetween prevents recursion into the node's children. We don't
      want to recurse when the node is a list element.

      This allows us to treat list elements and their contents as a single entity for movement purposes.
      This means we can move top-level elements up and down past a list element. Before, with
      recursion, top-level elements would move inside the list element, often breaking the document
      structure. Note this still allows us to move nested elements **within** list elements.
    */
    return !anyDescendantFieldIsNestedElementField(node);
  });
  if (dir < 0) {
    arr.reverse();
  }
  return arr;
};

export type Predicate = (
  node: Node,
  pos: number,
  parent: Node | null,
  index?: number
) => boolean;
type CommandDirection = "up" | "down" | "top" | "bottom";

const defaultPredicate: Predicate = (
  node: Node,
  _: number,
  parent: Node | null
) =>
  parent?.type.name === "doc" &&
  (node.type.name === "element" || !!node.textContent);

const findPredicate = (consumerPredicate: Predicate, currentPos: number) => ([
  candidateNode,
  candidatePos,
  candidateParent,
  candidateIndex,
]: NodesBetweenArgs) =>
  candidatePos !== currentPos &&
  consumerPredicate(
    candidateNode,
    candidatePos,
    candidateParent,
    candidateIndex
  );

const nextPosFinder = (consumerPredicate: Predicate) => (
  pos: number,
  state: EditorState,
  dir: CommandDirection
): number | null => {
  const all = new AllSelection(state.doc);
  const predicate = findPredicate(consumerPredicate, pos);
  const node = state.doc.nodeAt(pos);
  const nodeSize = node ? node.nodeSize : pos;
  switch (dir) {
    case "up": {
      const [, nextNodePos = null] =
        nodesBetween(state, pos, all.from).find(predicate) ?? [];

      return nextNodePos;
    }
    case "down": {
      const [nextNode = null, nextNodePos = null] =
        nodesBetween(state, pos, all.to).find(predicate) ?? [];

      return nextNodePos !== null && nextNode !== null
        ? nextNodePos + nextNode.nodeSize
        : null;
    }
    case "top": {
      return pos === all.from ? null : all.from;
    }
    case "bottom": {
      return pos + nodeSize === all.to ? null : all.to;
    }
  }
};

const moveNode = (consumerPredicate: Predicate) => (
  getPos: () => number | undefined,
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | false,
  dir: CommandDirection
) => {
  const pos = getPos();
  if (pos === undefined) {
    return false;
  }

  const nextPos = nextPosFinder(consumerPredicate)(pos, state, dir);

  if (nextPos === null) {
    return false;
  }

  if (dispatch === false) {
    return true;
  }

  const { node } = state.doc.childAfter(pos);
  const to = node ? pos + node.nodeSize : pos;
  const tr = state.tr.deleteRange(pos, to);

  if (node && (nextPos || nextPos === 0)) {
    const insertPos = tr.mapping.mapResult(nextPos).pos;
    tr.insert(insertPos, node.cut(0));
  }

  // const mappedPos = tr.mapping.mapResult(pos).pos;
  // merge the surrounding blocks if possible
  // this is only useful if we have root `textElement` nodes like in composer
  // as the time of this commit
  // if (canJoin(tr.doc, mappedPos)) {
  //   tr.join(mappedPos);
  // }

  dispatch(tr);
  return true;
};

const moveNodeUp = (predicate: Predicate) => (
  getPos: () => number | undefined
) => (view: EditorView, run = true) =>
  moveNode(predicate)(getPos, view.state, run && view.dispatch, "up");

const moveNodeDown = (predicate: Predicate) => (
  getPos: () => number | undefined
) => (view: EditorView, run = true) =>
  moveNode(predicate)(getPos, view.state, run && view.dispatch, "down");

const moveNodeTop = (predicate: Predicate) => (
  getPos: () => number | undefined
) => (view: EditorView, run = true) =>
  moveNode(predicate)(getPos, view.state, run && view.dispatch, "top");

const moveNodeBottom = (predicate: Predicate) => (
  getPos: () => number | undefined
) => (view: EditorView, run = true) =>
  moveNode(predicate)(getPos, view.state, run && view.dispatch, "bottom");

const buildMoveCommands = (predicate: Predicate) => (
  getPos: () => number | undefined,
  view: EditorView
) => ({
  moveUp: (run = true) => moveNodeUp(predicate)(getPos)(view, run),
  moveDown: (run = true) => moveNodeDown(predicate)(getPos)(view, run),
  moveTop: (run = true) => moveNodeTop(predicate)(getPos)(view, run),
  moveBottom: (run = true) => moveNodeBottom(predicate)(getPos)(view, run),
});

/**
 * Remove a node. If the view is passed, focus the editor after removal.
 */
const removeNode = (getPos: () => number | undefined) => (
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | false,
  view?: EditorView
) => {
  if (dispatch == false) {
    return true;
  }
  const pos = getPos();
  if (pos === undefined) {
    return;
  }
  const { node } = state.doc.childAfter(pos);
  const to = node ? pos + node.nodeSize : pos;

  dispatch(state.tr.deleteRange(pos, to));
  view?.focus();
};

const selectNode = (getPos: () => number | undefined) => (
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | false,
  view: EditorView
) => {
  if (dispatch === false) {
    return true;
  }
  const pos = getPos();
  if (pos === undefined) {
    return;
  }

  const tr = state.tr;
  dispatch(tr.setSelection(NodeSelection.create(tr.doc, pos)));
  view.focus();
};

const buildCommands = (predicate: Predicate) => (
  getPos: () => number | undefined,
  view: EditorView
) => ({
  ...buildMoveCommands(predicate)(getPos, view),
  remove: (run = true) =>
    removeNode(getPos)(view.state, run && view.dispatch, view),
  select: (run = true) =>
    selectNode(getPos)(view.state, run && view.dispatch, view),
});

// this forces our view to update every time an edit is made by inserting
// a decoration right on top of it and updating it's attributes
const createUpdateDecorations = () => (state: EditorState) => {
  const decorations: Decoration[] = [];
  state.doc.descendants((node, pos) => {
    if (node.attrs.addUpdateDecoration) {
      decorations.push(
        Decoration.node(
          pos,
          pos + node.nodeSize,
          {},
          {
            key: Math.random().toString(),
            inclusiveStart: false,
            inclusiveEnd: false,
          }
        )
      );
    }
  });

  return DecorationSet.create(state.doc, decorations);
};

const createParsers = <S extends Schema>(schema: S) => {
  const parser = DOMParser.fromSchema(schema);
  const serializer = DOMSerializer.fromSchema(schema);
  return { parser, serializer };
};

const docToHtml = (serializer: DOMSerializer, doc: Node) => {
  const dom = serializer.serializeFragment(doc.content);
  const e = document.createElement("div");
  e.appendChild(dom);
  return e.innerHTML;
};

const htmlToDoc = (parser: DOMParser, html: string) => {
  const dom = document.createElement("div");
  dom.innerHTML = html;
  return parser.parse(dom);
};

// Select all text within a node, as opposed to AllSelection
const selectAllText = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void
) => {
  dispatch?.(
    state.tr.setSelection(
      TextSelection.between(
        state.doc.resolve(0),
        state.doc.resolve(state.doc.content.size)
      )
    )
  );
  return true;
};

export {
  buildCommands,
  defaultPredicate,
  createUpdateDecorations,
  createParsers,
  docToHtml,
  htmlToDoc,
  selectAllText,
};
