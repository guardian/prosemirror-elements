import type OrderedMap from "orderedmap";
import type { Node, NodeSpec, Schema } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import { buildCommands, defaultPredicate } from "./helpers";
import { createPlugin } from "./plugin";
import type { TEmbed } from "./types/Embed";
import type { TFields } from "./types/Fields";

const addEmbedNode = (schema: OrderedMap<NodeSpec>): OrderedMap<NodeSpec> =>
  schema.append({
    embed: {
      group: "block",
      attrs: {
        type: {},
        fields: {
          default: {},
        },
        hasErrors: {
          default: false,
        },
      },
      draggable: false,
      toDOM: (node: Node) => [
        "embed-attrs",
        {
          type: node.attrs.type as string,
          fields: JSON.stringify(node.attrs.fields),
          "has-errors": JSON.stringify(node.attrs.hasErrors),
        },
      ],
      parseDOM: [
        {
          tag: "embed-attrs",
          getAttrs: (dom: Element) => {
            if (typeof dom === "string") {
              return;
            }
            const hasErrorAttr = dom.getAttribute("has-errors");
            console.log(dom.getAttribute("fields"));
            return {
              type: dom.getAttribute("type"),
              fields: JSON.parse(dom.getAttribute("fields") ?? "{}") as unknown,
              hasErrors: hasErrorAttr && hasErrorAttr !== "false",
            };
          },
        },
      ],
    },
  });

const build = (
  types: Record<string, TEmbed<TFields>>,
  predicate = defaultPredicate
) => {
  const typeNames = Object.keys(types);
  const plugin = createPlugin(types, buildCommands(predicate));
  return {
    insertEmbed: (type: string, fields = {}) => (
      state: EditorState,
      dispatch: (tr: Transaction<Schema>) => void
    ): void => {
      if (!typeNames.includes(type)) {
        throw new Error(
          `[prosemirror-embeds]: ${type} is not recognised. Only ${typeNames.join(
            ", "
          )} have can be added`
        );
      }
      // check whether we can
      dispatch(
        state.tr.replaceSelectionWith(
          (state.schema as Schema).nodes.embed.create({ type, fields })
        )
      );
    },
    hasErrors: (state: EditorState) => plugin.getState(state).hasErrors,
    plugin,
  };
};

export { build, addEmbedNode };
