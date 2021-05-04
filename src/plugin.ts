import type { Node, Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import type { buildCommands } from "./helpers";
import { createDecorations } from "./helpers";
import type { TEmbed } from "./types/Embed";
import type { TFields } from "./types/Fields";

const decorations = createDecorations("embed");

export type PluginState = { hasErrors: boolean };

export const createPlugin = <LocalSchema extends Schema>(
  types: Record<string, TEmbed<TFields>>,
  commands: ReturnType<typeof buildCommands>
): Plugin<PluginState, LocalSchema> => {
  type EmbedNode = Node<LocalSchema>;

  const hasErrors = (doc: Node) => {
    let foundError = false;
    doc.descendants((node: EmbedNode) => {
      if (!foundError) {
        if (node.type.name === "embed") {
          foundError = node.attrs.hasErrors as boolean;
        }
      } else {
        return false;
      }
    });
    return foundError;
  };

  return new Plugin<PluginState, LocalSchema>({
    state: {
      init: (_, state) => ({
        hasErrors: hasErrors(state.doc),
      }),
      apply: (_tr, _value, _oldState, state) => ({
        hasErrors: hasErrors(state.doc),
      }),
    },
    props: {
      decorations,
      nodeViews: {
        embed: (initNode: EmbedNode, view, getPos) => {
          const dom = document.createElement("div");
          dom.contentEditable = "false";
          const mount = types[initNode.attrs.type as string];
          const pos = typeof getPos === "boolean" ? 0 : getPos();

          const update = mount(
            dom,
            (fields: Record<string, string>, hasErrors: boolean) => {
              view.dispatch(
                view.state.tr.setNodeMarkup(pos, undefined, {
                  ...initNode.attrs,
                  fields,
                  hasErrors,
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
                node.type.name === "embed" &&
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
            destroy: () => null,
          };
        },
      },
    },
  });
};
