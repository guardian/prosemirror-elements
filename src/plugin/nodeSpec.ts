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
    (acc, [fieldName, propSpec]) =>
      acc.append(getNodeSpecForField(elementName, fieldName, propSpec)),
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

export const getNodeSpecForField = (
  elementName: string,
  fieldName: string,
  field: Field
): NodeSpec => {
  switch (field.type) {
    case "text":
      return {
        [fieldName]: {
          content: "text*",
          toDOM: getDefaultToDOMForContentNode(elementName, fieldName),
          parseDOM: [{ tag: getTagForNode(elementName, fieldName) }],
        },
      };
    case "richText":
      return {
        [fieldName]: {
          content: field.content ?? "paragraph+",
          toDOM:
            field.toDOM ??
            getDefaultToDOMForContentNode(elementName, fieldName),
          parseDOM: field.parseDOM ?? [
            { tag: getTagForNode(elementName, fieldName) },
          ],
        },
      };
    case "checkbox":
      return {
        [fieldName]: {
          atom: true,
          toDOM: getDefaultToDOMForLeafNode(elementName, fieldName),
          parseDOM: getDefaultParseDOMForLeafNode(elementName, fieldName),
          attrs: {
            fields: {
              default: field.defaultValue,
            },
          },
        },
      };
    case "dropdown":
      return {
        [fieldName]: {
          atom: true,
          toDOM: getDefaultToDOMForLeafNode(elementName, fieldName),
          parseDOM: getDefaultParseDOMForLeafNode(elementName, fieldName),
          attrs: {
            fields: {
              default: field.defaultValue,
            },
          },
        },
      };
    case "custom":
      return {
        [fieldName]: {
          atom: true,
          toDOM: getDefaultToDOMForLeafNode(elementName, fieldName),
          parseDOM: getDefaultParseDOMForLeafNode(elementName, fieldName),
          attrs: {
            fields: {
              default: { value: field.defaultValue },
            },
          },
        },
      };
  }
};

const getDefaultToDOMForContentNode = (
  elementName: string,
  fieldName: string
) => () =>
  [
    getTagForNode(elementName, fieldName),
    { class: getClassForNode(elementName, fieldName) },
    0,
  ] as const;

const getDefaultToDOMForLeafNode = (elementName: string, fieldName: string) => (
  node: Node
) => [
  getTagForNode(elementName, fieldName),
  {
    class: getClassForNode(elementName, fieldName),
    type: node.attrs.type as string,
    fields: JSON.stringify(node.attrs.fields),
    "has-errors": JSON.stringify(node.attrs.hasErrors),
  },
];

const getDefaultParseDOMForLeafNode = (
  elementName: string,
  fieldName: string
) => [
  {
    tag: getTagForNode(elementName, fieldName),
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

const getClassForNode = (elementName: string, fieldName: string) =>
  `ProsemirrorElement__${elementName}-${fieldName}`;

const getTagForNode = (elementName: string, fieldName: string) =>
  `element-${elementName}-${fieldName}`.toLowerCase();

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
