import { Plugin } from 'prosemirror-state';
import { Node, Schema } from 'prosemirror-model';
import { createDecorations, buildCommands } from './helpers';
import Embed from './types/Embed';
import TFields from './types/Fields';

const decorations = createDecorations('embed');

export default <LocalSchema extends Schema>(types: {[embedType: string]: Embed<TFields>}, commands: ReturnType<typeof buildCommands>) => {
  type EmbedNode = Node<LocalSchema>;
  return new Plugin({
    state: {
      init: () => ({
        hasErrors: false
      }),
      apply: (tr, value, oldState, newState) => {
        let hasErrors = false;
        newState.doc.descendants((node: EmbedNode, pos, parent) => {
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
      decorations,
      nodeViews: {
        embed: (initNode: EmbedNode, view, getPos) => {
          const dom = document.createElement('div');
          const mount = types[initNode.attrs.type];

          const update = mount(
            dom,
            (fields: {[field: string]: string}, hasErrors: boolean) => {
              view.dispatch(
                view.state.tr.setNodeMarkup(getPos(), undefined, {
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
            update: (node: EmbedNode) => {
              if (
                node.type.name === 'embed' &&
                node.attrs.type === initNode.attrs.type
              ) {
                update(
                  node.attrs.fields,
                  commands(getPos(), view.state, view.dispatch)
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
  })
}

