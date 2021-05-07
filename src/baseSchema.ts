import type { Node, NodeSpec } from "prosemirror-model";

export const baseEmbedSchema: NodeSpec = {
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
  imageEmbed: {
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
        type: node.attrs.type as string,
        fields: JSON.stringify(node.attrs.fields),
        "has-errors": JSON.stringify(node.attrs.hasErrors),
      },
      0,
    ],
    parseDOM: [
      {
        tag: "embed-attrs",
        getAttrs: (dom: Element) => {
          if (typeof dom === "string") {
            return;
          }
          const hasErrorAttr = dom.getAttribute("has-errors");

          return {
            type: dom.getAttribute("type"),
            fields: JSON.parse(dom.getAttribute("fields") ?? "{}") as unknown,
            hasErrors: hasErrorAttr && hasErrorAttr !== "false",
          };
        },
      },
    ],
  },
};
