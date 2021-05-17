import OrderedMap from "orderedmap";
import type { Node, NodeSpec } from "prosemirror-model";
import type { Field, FieldSpec } from "./types/Embed";

export const getNodeSpecFromFieldSpec = <FSpec extends FieldSpec<string>>(
  embedName: string,
  fieldSpec: FSpec
): OrderedMap<NodeSpec> => {
  const propSpecs = Object.entries(fieldSpec).reduce(
    (acc, [propName, propSpec]) =>
      acc.append(getNodeSpecForProp(embedName, propName, propSpec)),
    OrderedMap.from<NodeSpec>({})
  );

  return propSpecs.append(getNodeSpecForEmbed(embedName, fieldSpec));
};

const getNodeSpecForEmbed = (
  embedName: string,
  fieldSpec: FieldSpec<string>
): NodeSpec => ({
  [embedName]: {
    group: "block",
    content: Object.keys(fieldSpec).join(" "),
    attrs: {
      type: embedName,
      hasErrors: {
        default: false,
      },
    },
    draggable: false,
    toDOM: (node: Node) => [
      embedName,
      {
        type: node.attrs.type as string,
        fields: JSON.stringify(node.attrs.fields),
        "has-errors": JSON.stringify(node.attrs.hasErrors),
      },
      0,
    ],
    parseDOM: [
      {
        tag: embedName,
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
});

const getNodeSpecForProp = (
  embedName: string,
  propName: string,
  prop: Field
): NodeSpec => {
  switch (prop.type) {
    case "richText":
      return {
        [propName]: {
          content: prop.content ?? "paragraph",
          toDOM:
            prop.toDOM ?? getDefaultToDOMForContentNode(embedName, propName),
          parseDOM: prop.parseDOM ?? [{ tag: "div" }],
        },
      };
    case "checkbox":
      return {
        [propName]: {
          atom: true,
          toDOM: getDefaultToDOMForLeafNode(embedName, propName),
          parseDOM: getDefaultParseDOMForLeafNode(embedName, propName),
          attrs: {
            fields: {
              default: { value: prop.defaultValue },
            },
          },
        },
      };
  }
};

const getDefaultToDOMForContentNode = (
  embedName: string,
  propName: string
) => () => ["div", { class: getClassForNode(embedName, propName) }, 0] as const;

const getDefaultToDOMForLeafNode = (embedName: string, propName: string) => (
  node: Node
) => [
  getTagForNode(embedName, propName),
  {
    class: getClassForNode(embedName, propName),
    type: node.attrs.type as string,
    fields: JSON.stringify(node.attrs.fields),
    "has-errors": JSON.stringify(node.attrs.hasErrors),
  },
];

const getDefaultParseDOMForLeafNode = (embedName: string, propName: string) => [
  {
    tag: getTagForNode(embedName, propName),
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
];

const getClassForNode = (embedName: string, propName: string) =>
  `ProsemirrorEmbed__${embedName}-${propName}`;

const getTagForNode = (embedName: string, propName: string) =>
  `embed-${embedName}-${propName}`;
