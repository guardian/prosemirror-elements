import OrderedMap from "orderedmap";
import type { Node, NodeSpec } from "prosemirror-model";
import type { ElementProp, ElementProps } from "./types/Embed";

export const getNodeSpecFromProps = <Props extends ElementProps>(
  embedName: string,
  props: Props
): OrderedMap<NodeSpec> => {
  const propSpecs = props.reduce(
    (acc, prop) => acc.append(getNodeSpecForProp(embedName, prop)),
    OrderedMap.from<NodeSpec>({})
  );

  return propSpecs.append(getNodeSpecForEmbed(embedName, props));
};

const getNodeSpecForEmbed = (
  embedName: string,
  props: ElementProps
): NodeSpec => ({
  [embedName]: {
    group: "block",
    content: props.map((prop) => prop.name).join(" "),
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

const getNodeSpecForProp = (embedName: string, prop: ElementProp): NodeSpec => {
  switch (prop.type) {
    case "richText":
      return {
        [prop.name]: {
          content: prop.content ?? "paragraph",
          toDOM:
            prop.toDOM ?? getDefaultToDOMForContentNode(embedName, prop.name),
          parseDOM: prop.parseDOM ?? [{ tag: "div" }],
        },
      };
    case "checkbox":
      return {
        [prop.name]: {
          atom: true,
          toDOM: getDefaultToDOMForLeafNode(embedName, prop.name),
          parseDOM: getDefaultParseDOMForLeafNode(embedName, prop.name),
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
