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
};

const defaultPredicate = (node, pos, parent) =>
  parent.type.name === 'doc' &&
  (node.type.name === 'embed' || node.textContent);

const moveNode = (pos, predicate, state, dispatch, dir) => {
  const all = new AllSelection(state.doc);

  const [nextNode, nextNodePos] =
    nodesBetween(state, pos, dir < 0 ? all.from : all.to).find(
      ([candidateNode, candidatePos, candidateParent, candidateIndex]) =>
        candidatePos !== pos &&
        predicate(candidateNode, candidatePos, candidateParent, candidateIndex)
    ) || [];

  if (typeof nextNodePos === 'undefined') {
    return false;
  }

  if (!dispatch) {
    return true;
  }

  const nodePos = dir < 0 ? nextNodePos : nextNodePos + nextNode.nodeSize;

  const { node } = state.doc.childAfter(pos);

  const tr = state.tr.deleteRange(pos, pos + 1);
  const insertPos = tr.mapping.mapResult(nodePos).pos;
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

const moveNodeUp = (pos, predicate = defaultPredicate) => (state, dispatch) =>
  moveNode(pos, predicate, state, dispatch, -1);

const moveNodeDown = (pos, predicate = defaultPredicate) => (state, dispatch) =>
  moveNode(pos, predicate, state, dispatch, 1);

const removeNode = pos => (state, dispatch) => {
  if (!dispatch) {
    return true;
  }
  const pos = pos();
  dispatch(state.tr.deleteRange(pos, pos + 1));
};

const buildCommands = (pos, state, dispatch) => ({
  moveUp: (run = true) => moveNodeUp(pos)(state, run && dispatch),
  moveDown: (run = true) => moveNodeDown(pos)(state, run && dispatch),
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

export { buildCommands, stateToNodeView };
