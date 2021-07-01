import type { Node } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import { AllSelection } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { Decoration, DecorationSet } from "prosemirror-view";
import type { SetMedia } from "./elements/image/element";

type NodesBetweenArgs = [Node, number, Node, number];
export type Commands = ReturnType<typeof buildCommands>;

const nodesBetween = (state: EditorState, _from: number, _to: number) => {
  const dir = _to - _from;
  const range = [_from, _to];
  range.sort((a, b) => a - b);
  const [from, to] = range;

  const arr: NodesBetweenArgs[] = [];
  state.doc.nodesBetween(
    from,
    to,
    (node: Node, pos: number, parent: Node, index: number) =>
      !!arr.push([node, pos, parent, index])
  );
  if (dir < 0) {
    arr.reverse();
  }
  return arr;
};

type Predicate = (
  node: Node,
  pos: number,
  parent: Node,
  index?: number
) => boolean;
type CommandDirection = "up" | "down" | "top" | "bottom";

const defaultPredicate: Predicate = (node: Node, pos: number, parent: Node) =>
  parent.type.name === "doc" &&
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

      return nextNodePos && nextNode && nextNodePos + nextNode.nodeSize;
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

  if (!dispatch) {
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

const removeNode = (getPos: () => number | undefined) => (
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | false
) => {
  if (!dispatch) {
    return true;
  }
  const pos = getPos();
  if (pos === undefined) {
    return;
  }
  const { node } = state.doc.childAfter(pos);
  const to = node ? pos + node.nodeSize : pos;

  dispatch(state.tr.deleteRange(pos, to));
};

const buildCommands = (predicate: Predicate) => (
  getPos: () => number | undefined,
  view: EditorView
) => ({
  ...buildMoveCommands(predicate)(getPos, view),
  remove: (run = true) => removeNode(getPos)(view.state, run && view.dispatch),
});

// this forces our view to update every time an edit is made by inserting
// a decoration right on top of it and updating it's attributes
const createDecorations = (name: string) => (state: EditorState) => {
  const decorations: Decoration[] = [];
  state.doc.descendants((node, pos) => {
    if (node.type.name === name) {
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

const onGridMessgae = (setMedia: SetMedia, modal: HTMLElement) => ({
  data,
}: {
  data: {
    image: {
      data: {
        id: string;
      };
    };
    crop: {
      data: {
        specification: {
          uri: string;
        };
        assets: Array<{ secureUrl: string }>;
      };
    };
  };
}) => {
  modal.style.display = "None";
  setMedia(
    data.image.data.id,
    data.crop.data.specification.uri,
    data.crop.data.assets.map((_) => _.secureUrl)
  );
};

const onSelectImage = (setMedia: SetMedia) => {
  const modal = document.querySelector(".modal") as HTMLElement;
  modal.style.display = "Inherit";

  (document.querySelector(
    ".modal__body iframe"
  ) as HTMLIFrameElement).src = `https://media.test.dev-gutools.co.uk/`;

  const listner = onGridMessgae(setMedia, modal);

  window.addEventListener("message", listner, {
    once: true,
  });

  document.querySelector(".modal__dismiss")?.addEventListener(
    "click",
    () => {
      window.removeEventListener("message", listner);
      modal.style.display = "None";
    },
    { once: false }
  );
};

const onCropImage = (mediaId: string, setMedia: SetMedia) => {
  const modal = document.querySelector(".modal") as HTMLElement;
  modal.style.display = "Inherit";

  (document.querySelector(
    ".modal__body iframe"
  ) as HTMLIFrameElement).src = `https://media.test.dev-gutools.co.uk/images/${mediaId}`;

  const listner = onGridMessgae(setMedia, modal);

  window.addEventListener("message", listner, {
    once: true,
  });

  document.querySelector(".modal__dismiss")?.addEventListener(
    "click",
    () => {
      window.removeEventListener("message", listner);
      modal.style.display = "None";
    },
    { once: false }
  );
};

export {
  buildCommands,
  defaultPredicate,
  createDecorations,
  onSelectImage,
  onCropImage,
};
