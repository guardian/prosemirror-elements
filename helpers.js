import { AllSelection } from 'prosemirror-state';
// import { canJoin } from 'prosemirror-transform';
import { DecorationSet, Decoration } from 'prosemirror-view';

const nodesBetween = (state, _from, _to) => {
  const dir = _to - _from;
  const range = [_from, _to];
  range.sort((a, b) => a - b);
  const [from, to] = range;
  let arr = [];
  state.doc.nodesBetween(from, to, (...args) => arr.push(args));
  if (dir < 0) {
    arr.reverse();
  }
  return arr;
  ([candidateNode, candidatePos, candidateParent, candidateIndex]) =>
    candidatePos !== pos &&
    predicate(candidateNode, candidatePos, candidateParent, candidateIndex);
};

const defaultPredicate = (node, pos, parent) =>
  parent.type.name === 'doc' &&
  (node.type.name === 'embed' || node.textContent);

const findPredicate = (consumerPredicate, currentPos) => ([
  candidateNode,
  candidatePos,
  candidateParent,
  candidateIndex
]) =>
  candidatePos !== currentPos &&
  consumerPredicate(
    candidateNode,
    candidatePos,
    candidateParent,
    candidateIndex
  );

const nextPosFinder = consumerPredicate => (pos, state, dir) => {
  const all = new AllSelection(state.doc);
  const predicate = findPredicate(consumerPredicate, pos);

  switch (dir) {
    case 'up': {
      const [, nextNodePos] =
        nodesBetween(state, pos, all.from).find(predicate) || [];

      if (typeof nextNodePos === 'undefined') {
        return null;
      }

      return nextNodePos;
    }
    case 'down': {
      const [nextNode, nextNodePos] =
        nodesBetween(state, pos, all.to).find(predicate) || [];

      if (typeof nextNodePos === 'undefined') {
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

const moveNode = consumerPredicate => (pos, state, dispatch, dir) => {
  const nextPos = nextPosFinder(consumerPredicate)(pos, state, dir);

  if (nextPos === null) {
    return false;
  }

  if (!dispatch) {
    return true;
  }

  const { node } = state.doc.childAfter(pos);

  const tr = state.tr.deleteRange(pos, pos + 1);
  const insertPos = tr.mapping.mapResult(nextPos).pos;
  tr.insert(insertPos, node.type.create({ ...node.attrs }));

  // const mappedPos = tr.mapping.mapResult(pos).pos;
  // merge the surrounding blocks if possible
  // this is only useful if we have root `textElement` nodes like in composer
  // as the time of this commit
  // if (canJoin(tr.doc, mappedPos)) {
  //   tr.join(mappedPos);
  // }

  dispatch(tr);
};

const moveNodeUp = predicate => pos => (state, dispatch) =>
  moveNode(predicate)(pos, state, dispatch, 'up');

const moveNodeDown = predicate => pos => (state, dispatch) =>
  moveNode(predicate)(pos, state, dispatch, 'down');

const moveNodeTop = predicate => pos => (state, dispatch) =>
  moveNode(predicate)(pos, state, dispatch, 'top');

const moveNodeBottom = predicate => pos => (state, dispatch) =>
  moveNode(predicate)(pos, state, dispatch, 'bottom');

const buildMoveCommands = predicate => (pos, state, dispatch) => ({
  moveUp: (run = true) => moveNodeUp(predicate)(pos)(state, run && dispatch),
  moveDown: (run = true) =>
    moveNodeDown(predicate)(pos)(state, run && dispatch),
  moveTop: (run = true) => moveNodeTop(predicate)(pos)(state, run && dispatch),
  moveBottom: (run = true) =>
    moveNodeBottom(predicate)(pos)(state, run && dispatch)
});

const removeNode = pos => (state, dispatch) => {
  if (!dispatch) {
    return true;
  }
  dispatch(state.tr.deleteRange(pos, pos + 1));
};

const buildCommands = predicate => (pos, state, dispatch) => ({
  ...buildMoveCommands(predicate)(pos, state, dispatch),
  remove: (run = true) => removeNode(pos)(state, run && dispatch)
});

const stateToNodeView = name => ({
  packDecos: state => {
    let decorations = [];
    state.doc.descendants((node, pos) => {
      if (node.type.name === name) {
        decorations.push(
          Decoration.node(
            pos,
            pos + 1,
            {
              type: 'embed',
              state
            },
            {
              inclusiveStart: false,
              inclusiveEnd: false
            }
          )
        );
      }
    });
    return DecorationSet.create(state.doc, decorations);
  },
  unpackDeco: decorations =>
    decorations.find(deco => deco.type.attrs.type === name).type.attrs.state
});

export { buildCommands, defaultPredicate, stateToNodeView };
