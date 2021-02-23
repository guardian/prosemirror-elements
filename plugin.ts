import { Plugin } from "prosemirror-state";
import { Node, Schema } from "prosemirror-model";
import { createDecorations, buildCommands } from "./helpers";
import Embed from "./types/Embed";
import TFields from "./types/Fields";
import { embedSchema } from "./embed";

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
        embed: (initNode: EmbedNode, view, getPos) => {
          console.log("nodeView called");

          const dom = document.createElement("div");
          const contentDOM = document.createElement("div");
          dom.contentEditable = "false";
          const createEmbedView = types[initNode.attrs.type];
          console.log({types, type: initNode.attrs})
          const update = createEmbedView(
            dom,
            contentDOM,
            (fields: { [field: string]: string }, hasErrors: boolean) => {
              console.log({ fields });
              console.log(getPos(), view.state.doc.resolve(getPos()))
              view.dispatch(
                view.state.tr.setNodeMarkup(getPos(), undefined, {
                  ...initNode.attrs,
                  fields,
                  hasErrors,
                })
              );
            },
            initNode.attrs.fields,
            commands(getPos(), view.state, view.dispatch)
          );

          return {
            dom,
            contentDOM,
            update: (node: EmbedNode) => {
              if (
                node.type.name === "embed" &&
                node.attrs.type === initNode.attrs.type
              ) {
                console.log("updating");
                update(
                  node.attrs.fields,
                  commands(getPos(), view.state, view.dispatch)
                );
                return true;
              }

              console.log("update false", node.type.name, node.attrs.type);
              return false;
            },
            stopEvent: () => true,
            destroy: () => null,
          };
        },
      },
    },
  });
};
