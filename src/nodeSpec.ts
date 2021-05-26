import OrderedMap from "orderedmap";
import type { Node, NodeSpec, Schema } from "prosemirror-model";
import { DOMParser, Fragment } from "prosemirror-model";
import type { FieldNameToValueMap } from "./nodeViews/helpers";
import { fieldTypeToViewMap } from "./nodeViews/helpers";
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
    content: getDeterministicFieldOrder(Object.keys(fieldSpec)).join(" "),
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

export const createNodesForFieldValues = <
  S extends Schema,
  FSpec extends FieldSpec<Name>,
  Name extends string
>(
  schema: S,
  fieldSpec: FSpec,
  fieldValues: Partial<FieldNameToValueMap<FSpec>>
): Node[] => {
  const orderedFieldNames = getDeterministicFieldOrder(
    Object.keys(fieldSpec) as Array<Extract<keyof FSpec, Name>>
  );

  return orderedFieldNames.map((fieldName) => {
    const field = fieldSpec[fieldName];
    const fieldNodeView = fieldTypeToViewMap[field.type];
    const nodeType = schema.nodes[fieldName];
    const fieldValue =
      fieldValues[fieldName] ?? // The value supplied when the embed is insert
      fieldSpec[fieldName].defaultValue ?? // The default value supplied by the embed field spec
      fieldTypeToViewMap[field.type].defaultValue; // The default value supplied by the FieldView

    if (fieldNodeView.fieldType === "CONTENT") {
      const content = createContentForFieldValue(schema, fieldValue as string);
      return nodeType.create(
        { type: field.type },
        content.firstChild ?? Fragment.empty
      );
    } else {
      return nodeType.create({ type: field.type, fields: fieldValue });
    }
  });
};

const createContentForFieldValue = <S extends Schema>(
  schema: S,
  fieldValue: string
) => {
  const parser = DOMParser.fromSchema(schema);
  const element = document.createElement("div");
  element.innerHTML = fieldValue;
  return parser.parse(element);
};

/**
 * It doesn't really matter which order we add our fields to our NodeSpec –
 * but it does matter that we reliably match the order we create them to the
 * order that they're added to the schema. This function gives us a fixed order.
 */
export const getDeterministicFieldOrder = <Name extends string>(
  fieldNames: Name[]
): Name[] => fieldNames.slice().sort();
