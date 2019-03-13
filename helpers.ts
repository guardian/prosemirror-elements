import { AllSelection, EditorState, Transaction } from 'prosemirror-state';
// import { canJoin } from 'prosemirror-transform';
import { DecorationSet, Decoration, EditorView } from 'prosemirror-view';
import { Node } from 'prosemirror-model';

type TNodesBetweenArgs = [Node<any>, number, Node<any>, number];

const nodesBetween = (state: EditorState, _from: number, _to: number) => {
  const dir = _to - _from;
  const range = [_from, _to];
  range.sort((a, b) => a - b);
  const [from, to] = range;

  let arr: Array<TNodesBetweenArgs> = [];
  state.doc.nodesBetween(
    from,
    to,
    (node: Node<any>, pos: number, parent: Node<any>, index: number) =>
      !!arr.push([node, pos, parent, index])
  );
  if (dir < 0) {
    arr.reverse();
  }
  return arr;
};

type TPredicate = (
  node: Node<any>,
  pos: number,
  parent: Node<any>,
  index?: number
) => boolean;
type TDirection = 'up' | 'down' | 'top' | 'bottom';

const defaultPredicate: TPredicate = (node: Node, pos: number, parent: Node) =>
  parent.type.name === 'doc' &&
  (node.type.name === 'embed' || !!node.textContent);

const findPredicate = (consumerPredicate: TPredicate, currentPos: number) => ([
  candidateNode,
  candidatePos,
  candidateParent,
  candidateIndex
]: TNodesBetweenArgs) =>
  candidatePos !== currentPos &&
  consumerPredicate(
    candidateNode,
    candidatePos,
    candidateParent,
    candidateIndex
  );

const nextPosFinder = (consumerPredicate: TPredicate) => (
  pos: number,
  state: EditorState,
  dir: TDirection
): number | null => {
  const all = new AllSelection(state.doc);
  const predicate = findPredicate(consumerPredicate, pos);

  switch (dir) {
    case 'up': {
      const [, nextNodePos = null] =
        nodesBetween(state, pos, all.from).find(predicate) || [];

      return nextNodePos;
    }
    case 'down': {
      const [nextNode = null, nextNodePos = null] =
        nodesBetween(state, pos, all.to).find(predicate) || [];

      return nextNodePos && nextNode && nextNodePos + nextNode.nodeSize;
    }
    case 'top': {
      return pos === all.from ? null : all.from;
    }
    case 'bottom': {
      // as this is a node view the end is just pos + 1
      return pos + 1 === all.to ? null : all.to;
    }
    default: {
      console.warn(`Unknown direction: ${dir}`);
      return null;
    }
  }
};

const moveNode = (
  consumerPredicate: TPredicate,
  getPos: () => number,
  view: EditorView
) => (dir: TDirection) => (run = true) => {
  const { state } = view;
  const pos = getPos();
  const nextPos = nextPosFinder(consumerPredicate)(pos, state, dir);

  if (nextPos === null) {
    return false;
  }

  if (!run) {
    return true;
  }

  const { node } = state.doc.childAfter(pos);

  const tr = state.tr.deleteRange(pos, pos + 1);

  if (node && (nextPos || nextPos === 0)) {
    const insertPos = tr.mapping.mapResult(nextPos).pos;
    tr.insert(insertPos, node.type.create({ ...node.attrs }));
  }

  // const mappedPos = tr.mapping.mapResult(pos).pos;
  // merge the surrounding blocks if possible
  // this is only useful if we have root `textElement` nodes like in composer
  // as the time of this commit
  // if (canJoin(tr.doc, mappedPos)) {
  //   tr.join(mappedPos);
  // }

  view.dispatch(tr);
  return true;
};

const buildMoveCommands = (predicate: TPredicate) => (
  getPos: () => number,
  view: EditorView
) => {
  const mover = moveNode(predicate, getPos, view);
  return {
    moveUp: mover('up'),
    moveDown: mover('down'),
    moveTop: mover('top'),
    moveBottom: mover('bottom')
  };
};

const removeNode = (getPos: () => number) => (view: EditorView) => (
  run = true
) =>
  !run
    ? true
    : (view.dispatch(view.state.tr.deleteRange(getPos(), getPos() + 1)), false);

const buildCommands = (predicate: TPredicate) => (
  getPos: () => number,
  view: EditorView
) => ({
  ...buildMoveCommands(predicate)(getPos, view),
  remove: removeNode(getPos)(view)
});

// this forces our view to update every time an edit is made by inserting
// a decoration right on top of it and updating it's attributes
const createDecorations = (name: string) => (state: EditorState) => {
  let decorations: Decoration[] = [];
  state.doc.descendants((node, pos) => {
    if (node.type.name === name) {
      decorations.push(
        Decoration.node(
          pos,
          pos + 1,
          {},
          {
            key: Math.random().toString(),
            inclusiveStart: false,
            inclusiveEnd: false
          }
        )
      );
    }
  });
  return DecorationSet.create(state.doc, decorations);
};

export { buildCommands, defaultPredicate, createDecorations };
