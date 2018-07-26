import { Plugin } from 'prosemirror-state';
import { stateToNodeView } from './helpers';

const { packDecos, unpackDeco } = stateToNodeView('embed');

export default (types, commands) =>
  new Plugin({
    state: {
      init: () => ({
        hasErrors: false
      }),
      apply: (tr, value, oldState, newState) => {
        let hasErrors = false;
        newState.doc.descendants((node, pos, parent) => {
          if (node.type.name === 'embed' && !hasErrors) {
            hasErrors = node.attrs.hasErrors;
          }
        });
        return {
          hasErrors
        };
      }
    },
    props: {
      decorations: packDecos,
      nodeViews: {
        embed: (initNode, view, getPos) => {
          const dom = document.createElement('div');
          const mount = types[initNode.attrs.type];

          const update = mount(
            dom,
            (fields, hasErrors) => {
              view.dispatch(
                view.state.tr.setNodeMarkup(getPos(), null, {
                  ...initNode.attrs,
                  fields,
                  hasErrors
                })
              );
            },
            initNode.attrs.fields,
            commands(getPos(), view.state, view.dispatch)
          );

          return {
            dom,
            update: (node, decorations) => {
              if (
                node.type.name === 'embed' &&
                node.attrs.type === initNode.attrs.type
              ) {
                update(
                  node.attrs.fields,
                  commands(getPos(), unpackDeco(decorations), view.dispatch)
                );
                return true;
              }
              return false;
            },
            stopEvent: () => true,
            destroy: () => null
          };
        }
      }
    }
  });
