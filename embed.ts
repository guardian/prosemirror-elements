import { EditorState, Transaction } from "prosemirror-state";
import { Schema, Node, NodeSpec } from "prosemirror-model";
import { buildCommands, defaultPredicate } from "./helpers";
import Embed from "./types/Embed";

import buildPlugin from "./plugin";
import TFields from "./types/Fields";

export const embedSchema: { [key: string]: NodeSpec } = {
  caption: {
    group: "block",
    content: "paragraph",
    toDOM() {
      return ["div", { class: "imageNative-caption" }, 0];
    },
    parseDOM: [{ tag: "div" }],
  },
  altText: {
    group: "block",
    content: "paragraph",
    toDOM() {
      return ["div", { class: "imageNative-altText" }, 0];
    },
    parseDOM: [{ tag: "div" }],
  },
  embed: {
    group: "block",
    content: "caption altText",
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
        type: node.attrs.type,
        fields: JSON.stringify(node.attrs.fields),
        "has-errors": JSON.stringify(node.attrs.hasErrors),
      },
      0
    ],
    parseDOM: [
      {
        tag: "embed-attrs",
        getAttrs: (dom: HTMLElement) => {
          const hasErrorAttr = dom.getAttribute("has-errors");
          return {
            type: dom.getAttribute("type"),
            fields: JSON.parse(dom.getAttribute("fields") || "{}"),
            hasErrors: hasErrorAttr && hasErrorAttr !== "false",
          };
        },
      },
    ],
  },
};

const addEmbedNode = (schema: OrderedMap<NodeSpec>) =>
  schema.append(embedSchema);

const build = (
  types: { [pluginKey: string]: Embed<TFields> },
  predicate = defaultPredicate
) => {
  const typeNames = Object.keys(types);
  const plugin = buildPlugin(types, buildCommands(predicate));
  return {
    insertEmbed: (type: string, fields = {}) => (
      state: EditorState,
      dispatch: (tr: Transaction<Schema>) => void
    ) => {
      if (typeNames.indexOf(type) === -1) {
        throw new Error(
          `[prosemirror-embeds]: ${type} is not recognised. Only ${typeNames.join(
            ", "
          )} have can be added`
        );
      }
      // check whether we can
      dispatch(
        state.tr.replaceSelectionWith(
          state.schema.nodes.embed.create({ type, fields })
        )
      );
    },
    hasErrors: (state: EditorState) => plugin.getState(state).hasErrors,
    plugin,
  };
};

export { build, addEmbedNode };
