import { Plugin } from 'prosemirror-state';
import { Node, Schema } from 'prosemirror-model';
import { createDecorations, buildCommands } from './helpers';
import Embed from './types/Embed';
import TFields from './types/Fields';

export default <LocalSchema extends Schema>(
  types: { [embedType: string]: Embed<TFields> },
  commands: ReturnType<typeof buildCommands>,
  nodeName = 'embed'
) => {
  type EmbedNode = Node<LocalSchema>;

  const decorations = createDecorations(nodeName);

  const hasErrors = (doc: Node) => {
    let foundError = false;
    doc.descendants((node: EmbedNode, pos, parent) => {
      if (!foundError) {
        if (node.type.name === nodeName) {
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
      // these decos force a redraw on every transaction in order to
      // make sure the `commands(false)` run again to check whether they can be run
      // this feels wildly inefficient but I hope whatever is rendering below here
      // has got our back
      decorations,
      nodeViews: {
        embed: (initNode: EmbedNode, view, getPos) => {
          const dom = document.createElement('div');
          dom.contentEditable = 'false';
          const mount = types[initNode.attrs.type];
          const cmds = commands(getPos, view);

          const update = mount(
            dom,
            (fields: { [field: string]: string }, hasErrors: boolean) => {
              view.dispatch(
                view.state.tr.setNodeMarkup(getPos(), undefined, {
                  type: initNode.attrs.type,
                  fields,
                  hasErrors
                })
              );
            },
            initNode.attrs.fields,
            cmds
          );

          return {
            dom,
            update: (node: EmbedNode) =>
              node.type.name === nodeName &&
              node.attrs.type === initNode.attrs.type
                ? (update(node.attrs.fields), true)
                : false,
            stopEvent: () => true,
            destroy: () => null
          };
        }
      }
    }
  });
};
