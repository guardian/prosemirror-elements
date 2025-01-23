import type { Node, Schema } from "prosemirror-model";
import { DOMParser, DOMSerializer } from "prosemirror-model";
import type { EditorState, Selection, Transaction } from "prosemirror-state";
import { AllSelection, NodeSelection, TextSelection } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { Decoration, DecorationSet } from "prosemirror-view";
import { anyDescendantFieldIsNestedElementField } from "../fieldViews/NestedElementFieldView";
import { pluginKey } from "./constants";

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

  if (node) {
    const insertPos = tr.mapping.mapResult(nextPos).pos;
    tr.insert(insertPos, node.cut(0));
  }

  dispatch(tr);
  return true;
};

/**
 * Find all the nodes that match the predicate, returning the node and its
 * position.
 */
export const findAllNodesThatMatchPredicate = (
  node: Node,
  from: number,
  to: number,
  predicate: Predicate
) => {
  const result: Array<{
    node: Node;
    pos: number;
  }> = [];
  node.nodesBetween(from, to, (iterNode, pos, parent, index) => {
    if (predicate(iterNode, pos, parent, index)) {
      result.push({ node: iterNode, pos });
    }

    /*
      Returning false from state.doc.nodesBetween prevents recursion into the node's children. We don't
      want to recurse when the node is a list element.

      This allows us to treat list elements and their contents as a single entity for movement purposes.
      This means we can move top-level elements up and down past a list element. Before, with
      recursion, top-level elements would move inside the list element, often breaking the document
      structure. Note this still allows us to move nested elements **within** list elements.
    */
    return !anyDescendantFieldIsNestedElementField(iterNode);
  });

  return result;
};

/**
 * Get the range within which an element can be inserted.
 */
export const getValidElementInsertionRange = (
  node: Node,
  predicate: Predicate
): { from: number; to: number } | undefined => {
  const allSelection = new AllSelection(node);
  const validNodes = findAllNodesThatMatchPredicate(
    node,
    allSelection.from,
    allSelection.to,
    predicate
  );

  if (validNodes.length === 0) {
    return undefined;
  }

  const from = validNodes[0].pos;
  const toNode = validNodes[validNodes.length - 1];
  const to = toNode.pos + toNode.node.nodeSize + 1;

  return { from, to };
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
  if (dispatch === false) {
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

/**
 * Creates decorations that overlay elements that are beyond the move commands'
 * valid insertion ranges. Decorations that overlay nodes force their node views
 * to rerender when they change. This is the approach recommended by the library
 * author here:
 * https://discuss.prosemirror.net/t/force-nodes-of-specific-type-to-re-render/2480/10
 *
 * Creating decorations when nodes move into valid insertion ranges, and
 * removing them when they move out, forces them to rerender, ensuring that
 * their UI is kept up to date with the plugin state.
 */
const createUpdateDecorations = () => (state: EditorState): DecorationSet => {
  const decorations: Decoration[] = [];
  const pluginState = pluginKey.getState(state);

  if (!pluginState || !pluginState.validInsertionRange) {
    return DecorationSet.empty;
  }

  const {
    validInsertionRange: { from, to },
  } = pluginState;

  state.doc.descendants((node, pos) => {
    if (
      node.attrs.addUpdateDecoration &&
      (pos <= from || pos + node.nodeSize >= to)
    ) {
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

export const selectionHasChangedForRange = (
  from: number,
  to: number,
  currentSelection: Selection,
  newSelection: Selection
) => {
  if (newSelection.eq(currentSelection)) {
    return false;
  }

  const currentSelectionCoversRange = doRangesIntersect(
    { from, to },
    currentSelection
  );

  const newSelectionCoversRange = doRangesIntersect({ from, to }, newSelection);

  return currentSelectionCoversRange || newSelectionCoversRange;
};

type Range = {
  from: number;
  to: number;
};

const doRangesIntersect = (rangeA: Range, rangeB: Range) =>
  Math.max(rangeA.from, rangeB.from) <= Math.min(rangeA.to, rangeB.to);

export {
  buildCommands,
  defaultPredicate,
  createUpdateDecorations,
  createParsers,
  docToHtml,
  htmlToDoc,
  selectAllText,
};
