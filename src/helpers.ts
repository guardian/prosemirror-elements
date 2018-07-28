import { AllSelection, EditorState, Transaction } from 'prosemirror-state';
// import { canJoin } from 'prosemirror-transform';
import { DecorationSet, Decoration } from 'prosemirror-view';
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
) => {
  const all = new AllSelection(state.doc);
  const predicate = findPredicate(consumerPredicate, pos);

  switch (dir) {
    case 'up': {
      const [, nextNodePos = null] =
        nodesBetween(state, pos, all.from).find(predicate) || [];

      if (nextNodePos === null) {
        return null;
      }

      return nextNodePos;
    }
    case 'down': {
      const [nextNode = null, nextNodePos = null] =
        nodesBetween(state, pos, all.to).find(predicate) || [];

      if (nextNodePos === null || nextNode === null) {
        return null;
      }

      return nextNodePos + nextNode.nodeSize;
    }
    case 'top': {
      if (pos === all.from) {
        return false;
      }
      return all.from;
    }
    case 'bottom': {
      if (pos === all.to) {
        return false;
      }
      return all.to;
    }
    default: {
      console.warn(`Unknown direction: ${dir}`);
      return null;
    }
  }
};

const moveNode = (consumerPredicate: TPredicate) => (
  pos: number,
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | false,
  dir: TDirection
) => {
  const nextPos = nextPosFinder(consumerPredicate)(pos, state, dir);

  if (nextPos === null) {
    return false;
  }

  if (!dispatch) {
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

  dispatch(tr);
};

const moveNodeUp = (predicate: TPredicate) => (pos: number) => (
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | false
) => moveNode(predicate)(pos, state, dispatch, 'up');

const moveNodeDown = (predicate: TPredicate) => (pos: number) => (
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | false
) => moveNode(predicate)(pos, state, dispatch, 'down');

const moveNodeTop = (predicate: TPredicate) => (pos: number) => (
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | false
) => moveNode(predicate)(pos, state, dispatch, 'top');

const moveNodeBottom = (predicate: TPredicate) => (pos: number) => (
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | false
) => moveNode(predicate)(pos, state, dispatch, 'bottom');

const buildMoveCommands = (predicate: TPredicate) => (
  pos: number,
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | false
) => ({
  moveUp: (run = true) => moveNodeUp(predicate)(pos)(state, run && dispatch),
  moveDown: (run = true) =>
    moveNodeDown(predicate)(pos)(state, run && dispatch),
  moveTop: (run = true) => moveNodeTop(predicate)(pos)(state, run && dispatch),
  moveBottom: (run = true) =>
    moveNodeBottom(predicate)(pos)(state, run && dispatch)
});

const removeNode = (pos: number) => (
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | false
) => {
  if (!dispatch) {
    return true;
  }
  dispatch(state.tr.deleteRange(pos, pos + 1));
};

const buildCommands = (predicate: TPredicate) => (
  pos: number,
  state: EditorState,
  dispatch: (tr: Transaction) => void
) => ({
  ...buildMoveCommands(predicate)(pos, state, dispatch),
  remove: (run = true) => removeNode(pos)(state, run && dispatch)
});

const createDecorations = (name: string) => (state: EditorState) => {
  let decorations: Decoration[] = [];
  state.doc.descendants((node, pos) => {
    if (node.type.name === name) {
      decorations.push(
        Decoration.node(
          pos,
          pos + 1,
          { class: Math.random().toString() },
          {
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
