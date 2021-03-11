import { Plugin } from 'prosemirror-state';
import { Node, Schema } from 'prosemirror-model';
import { createDecorations, buildCommands } from './helpers';
import Embed from './types/Embed';
import TFields from './types/Fields';

const decorations = createDecorations('embed');

export default <LocalSchema extends Schema>(
  types: { [embedType: string]: Embed<TFields> },
  commands: ReturnType<typeof buildCommands>
) => {
  type EmbedNode = Node<LocalSchema>;

  const hasErrors = (doc: Node) => {
    let foundError = false;
    doc.descendants((node: EmbedNode, pos, parent) => {
      if (!foundError) {
        if (node.type.name === 'embed') {
          foundError = node.attrs.hasErrors;
        }
      } else {
        return false;
      }
    });
    return foundError;
  };

  return new Plugin({
    state: {
      init: (_, state) => ({
        hasErrors: hasErrors(state.doc)
      }),
      apply: (tr, value, oldState, state) => ({
        hasErrors: hasErrors(state.doc)
      })
    },
    props: {
      decorations,
      nodeViews: {
        embed: (initNode: EmbedNode, view, getPos) => {
          const dom = document.createElement('div');
          dom.contentEditable = 'false';
          const mount = types[initNode.attrs.type];
          const pos = typeof getPos === "boolean" ? 0 : getPos();


          const update = mount(
            dom,
            (fields: { [field: string]: string }, hasErrors: boolean) => {
              view.dispatch(
                view.state.tr.setNodeMarkup(pos, undefined, {
                  ...initNode.attrs,
                  fields,
                  hasErrors
                })
              );
            },
            initNode.attrs.fields,
            commands(pos, view.state, view.dispatch)
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
                  commands(pos, view.state, view.dispatch)
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
};
