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
  type TNode = Node<LocalSchema>;

  const hasErrors = (doc: Node) => {
    let foundError = false;
    doc.descendants((node: TNode, pos, parent) => {
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
        embed: (initNode: TNode, view, getPos) => {
          const dom = document.createElement('div');
          dom.contentEditable = 'false';
          const mount = types[initNode.attrs.type];

          console.log(view.state.doc);

          const update = mount(
            dom,
            (fields: { [field: string]: string }, hasErrors: boolean) => {
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
            update: (node: TNode) => {
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
  });
};
