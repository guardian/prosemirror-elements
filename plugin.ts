import { Plugin } from "prosemirror-state";
import { Node, Schema } from "prosemirror-model";
import { createDecorations, buildCommands } from "./helpers";
import Embed from "./types/Embed";
import TFields from "./types/Fields";
import { embedSchema } from "./embed";
import { RTENode } from "./RTENode";

const decorations = createDecorations("embed");

export default <LocalSchema extends Schema>(
  types: { [embedType: string]: Embed<TFields> },
  commands: ReturnType<typeof buildCommands>
) => {
  type EmbedNode = Node<LocalSchema>;

  const hasErrors = (doc: Node) => {
    let foundError = false;
    doc.descendants((node: EmbedNode, pos, parent) => {
      if (!foundError) {
        if (node.type.name === "embed") {
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
        hasErrors: hasErrors(state.doc),
      }),
      apply: (tr, value, oldState, state) => ({
        hasErrors: hasErrors(state.doc),
      }),
    },
    props: {
      decorations,
      nodeViews: {
        embed: (initNode: EmbedNode, view, getPos: () => number) => {
          console.log('mount', { view })
          const dom = document.createElement("div");
          dom.contentEditable = "false";
          const createEmbedView = types[initNode.attrs.type];

          const nestedEditors = {} as { [nodeType: string]: RTENode };
          initNode.forEach((node, offset, _index) => {
            console.log({_index})
            const typeName = node.type.name;
            if (nestedEditors[typeName]) {
              console.error(
                `[prosemirror-embeds]: Attempted to instantiate a nested editor with type ${typeName}, but another instance with that name has already been created.`
              );
            }
            nestedEditors[typeName] = new RTENode(node, view, getPos, offset);
          });

          const update = createEmbedView(
            dom,
            nestedEditors,
            (fields: { [field: string]: string }, hasErrors: boolean) => {
              view.dispatch(
                view.state.tr.setNodeMarkup(getPos(), undefined, {
                  ...initNode.attrs,
                  fields,
                  hasErrors,
                })
              );
            },
            initNode.attrs.fields,
            commands(getPos, view)
          );

          return {
            dom,
            update: (node: EmbedNode) => {
              console.log('update', node.type.name, node)
              if (
                node.type.name === "embed" &&
                node.attrs.type === initNode.attrs.type
              ) {
                update(
                  node.attrs.fields,
                  commands(getPos, view)
                );

                node.forEach((node, offset, _index) => {
                  const typeName = node.type.name;
                  const nestedEditor = nestedEditors[typeName];
                  if (!nestedEditor) {
                    console.error(`[prosemirror-embeds]: Could not find a nested editor for node type ${typeName} to update. This shouldn't happen!`)
                  }
                  nestedEditor.update(node, offset);
                })
                return true;
              }
              console.log("update false", node.type.name, node.attrs.type);
              return false;
            },
            stopEvent: () => true,
            destroy: () => {
              Object.values(nestedEditors).map(editor => editor.close())
            },
          };
        },
      },
    },
  });
};
