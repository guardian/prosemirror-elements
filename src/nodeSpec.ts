import OrderedMap from "orderedmap";
import type { Node, NodeSpec, Schema } from "prosemirror-model";
import { DOMParser } from "prosemirror-model";
import type { FieldNameToValueMap } from "./fieldViews/helpers";
import { fieldTypeToViewMap } from "./fieldViews/helpers";
import type { Field, FieldSpec } from "./types/Element";

export const getNodeSpecFromFieldSpec = <FSpec extends FieldSpec<string>>(
  elementName: string,
  fieldSpec: FSpec
): OrderedMap<NodeSpec> => {
  const propSpecs = Object.entries(fieldSpec).reduce(
    (acc, [propName, propSpec]) =>
      acc.append(getNodeSpecForProp(elementName, propName, propSpec)),
    OrderedMap.from<NodeSpec>({})
  );

  return propSpecs.append(getNodeSpecForElement(elementName, fieldSpec));
};

const getNodeSpecForElement = (
  elementName: string,
  fieldSpec: FieldSpec<string>
): NodeSpec => ({
  [elementName]: {
    group: "block",
    content: getDeterministicFieldOrder(Object.keys(fieldSpec)).join(" "),
    attrs: {
      type: elementName,
      hasErrors: {
        default: false,
      },
    },
    draggable: false,
    toDOM: (node: Node) => [
      elementName,
      {
        type: node.attrs.type as string,
        fields: JSON.stringify(node.attrs.fields),
        "has-errors": JSON.stringify(node.attrs.hasErrors),
      },
      0,
    ],
    parseDOM: [
      {
        tag: elementName,
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
  elementName: string,
  propName: string,
  prop: Field
): NodeSpec => {
  switch (prop.type) {
    case "text":
      return {
        [propName]: {
          content: "text*",
          toDOM: getDefaultToDOMForContentNode(elementName, propName),
          parseDOM: [{ tag: getTagForNode(elementName, propName) }],
        },
      };
    case "richText":
      return {
        [propName]: {
          content: prop.content ?? "paragraph+",
          toDOM:
            prop.toDOM ?? getDefaultToDOMForContentNode(elementName, propName),
          parseDOM: prop.parseDOM ?? [
            { tag: getTagForNode(elementName, propName) },
          ],
        },
      };
    case "checkbox":
      return {
        [propName]: {
          atom: true,
          toDOM: getDefaultToDOMForLeafNode(elementName, propName),
          parseDOM: getDefaultParseDOMForLeafNode(elementName, propName),
          attrs: {
            fields: {
              default: prop.defaultValue,
            },
          },
        },
      };
    case "custom":
      return {
        [propName]: {
          atom: true,
          toDOM: getDefaultToDOMForLeafNode(elementName, propName),
          parseDOM: getDefaultParseDOMForLeafNode(elementName, propName),
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
  elementName: string,
  propName: string
) => () =>
  [
    getTagForNode(elementName, propName),
    { class: getClassForNode(elementName, propName) },
    0,
  ] as const;

const getDefaultToDOMForLeafNode = (elementName: string, propName: string) => (
  node: Node
) => [
  getTagForNode(elementName, propName),
  {
    class: getClassForNode(elementName, propName),
    type: node.attrs.type as string,
    fields: JSON.stringify(node.attrs.fields),
    "has-errors": JSON.stringify(node.attrs.hasErrors),
  },
];

const getDefaultParseDOMForLeafNode = (
  elementName: string,
  propName: string
) => [
  {
    tag: getTagForNode(elementName, propName),
    getAttrs: (dom: Element) => {
      if (typeof dom === "string") {
        return;
      }
      const attrs = {
        fields: JSON.parse(dom.getAttribute("fields") ?? "{}") as unknown,
      };

      return attrs;
    },
  },
];

const getClassForNode = (elementName: string, propName: string) =>
  `ProsemirrorElement__${elementName}-${propName}`;

const getTagForNode = (elementName: string, propName: string) =>
  `element-${elementName}-${propName}`.toLowerCase();

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
    const fieldView = fieldTypeToViewMap[field.type];
    const nodeType = schema.nodes[fieldName];
    const fieldValue =
      fieldValues[fieldName] ?? // The value supplied when the element is inserted
      fieldSpec[fieldName].defaultValue ?? // The default value supplied by the element field spec
      fieldTypeToViewMap[field.type].defaultValue; // The default value supplied by the FieldView

    if (fieldView.fieldType === "CONTENT") {
      const node = nodeType.create({ type: field.type });
      return createContentForFieldValue(schema, fieldValue as string, node);
    } else {
      return nodeType.create({ type: field.type, fields: fieldValue });
    }
  });
};

const createContentForFieldValue = <S extends Schema>(
  schema: S,
  fieldValue: string,
  topNode: Node
) => {
  const parser = DOMParser.fromSchema(schema);
  const element = document.createElement("div");
  element.innerHTML = fieldValue;
  return parser.parse(element, { topNode });
};

/**
 * It doesn't really matter which order we add our fields to our NodeSpec –
 * but it does matter that we reliably match the order we create them to the
 * order that they're added to the schema. This function gives us a fixed order.
 */
export const getDeterministicFieldOrder = <Name extends string>(
  fieldNames: Name[]
): Name[] => fieldNames.slice().sort();
