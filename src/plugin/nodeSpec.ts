import OrderedMap from "orderedmap";
import type { Node, NodeSpec, NodeType, Schema } from "prosemirror-model";
import { DOMParser } from "prosemirror-model";
import type { FieldNameToValueMap } from "./helpers/fieldView";
import { fieldTypeToViewMap } from "./helpers/fieldView";
import type { FieldDescription, FieldDescriptions } from "./types/Element";

export const elementTypeAttr = "pme-element-type";
export const fieldNameAttr = "pme-field-name";

export const getNodeSpecFromFieldDescriptions = <
  FDesc extends FieldDescriptions<string>
>(
  elementName: string,
  groupName: string,
  fieldDescriptions: FDesc
): OrderedMap<NodeSpec> => {
  const propSpecs = Object.entries(fieldDescriptions).reduce(
    (acc, [fieldName, propSpec]) =>
      acc.append(getNodeSpecForField(elementName, fieldName, propSpec)),
    OrderedMap.from<NodeSpec>({})
  );

  return propSpecs.append(
    getNodeSpecForElement(elementName, groupName, fieldDescriptions)
  );
};

const getNodeSpecForElement = (
  elementName: string,
  groupName: string,
  fieldDescription: FieldDescriptions<string>
): NodeSpec => ({
  [elementName]: {
    group: groupName,
    content: getDeterministicFieldOrder(
      Object.keys(fieldDescription).map((fieldName) =>
        getNodeNameFromField(fieldName, elementName)
      )
    ).join(" "),
    attrs: {
      type: elementName,
      // Used to determine which nodes should receive update decorations, which force them to update when the document changes. See `createUpdateDecorations` in prosemirror.ts.
      addUpdateDecoration: {
        default: true,
      },
    },
    draggable: false,
    toDOM: (node: Node) => [
      "div",
      {
        [elementTypeAttr]: node.attrs.type as string,
        fields: JSON.stringify(node.attrs.fields),
      },
      0,
    ],
    parseDOM: [
      {
        tag: "div",
        getAttrs: (dom: Element) => {
          const domElementName = dom.getAttribute(elementTypeAttr);
          if (domElementName !== elementName) {
            return false;
          }

          return {
            type: elementName,
            fields: JSON.parse(dom.getAttribute("fields") ?? "{}") as unknown,
          };
        },
      },
    ],
  },
});

// A group for our field nodes. Exported to allow consumers to
// easily identify field nodes in their own code.
export const fieldGroupName = "pme-field";

export const getNodeSpecForField = (
  elementName: string,
  fieldName: string,
  field: FieldDescription
): NodeSpec => {
  const nodeName = getNodeNameFromField(fieldName, elementName);

  switch (field.type) {
    case "text": {
      return {
        [nodeName]: {
          group: fieldGroupName,
          content:
            field.isMultiline && !field.isCode ? "(text|hard_break)*" : "text*",
          toDOM: getDefaultToDOMForContentNode(nodeName),
          parseDOM: [
            {
              tag: "div",
              getAttrs: createGetAttrsForTextNode(nodeName),
              preserveWhitespace: field.isCode ? "full" : false,
            },
          ],
          code: field.isCode,
          marks: "",
          attrs: field.attrs,
        },
      };
    }
    case "richText": {
      return {
        [nodeName]: {
          group: fieldGroupName,
          content: field.content ?? "paragraph+",
          toDOM: getDefaultToDOMForContentNode(nodeName),
          parseDOM: [
            {
              tag: "div",
              getAttrs: createGetAttrsForTextNode(nodeName),
            },
          ],
          attrs: field.attrs,
        },
      };
    }
    case "checkbox":
      return {
        [nodeName]: {
          group: fieldGroupName,
          atom: true,
          toDOM: getDefaultToDOMForLeafNode(nodeName),
          parseDOM: getDefaultParseDOMForLeafNode(nodeName),
          attrs: {
            fields: {
              default: field.defaultValue,
            },
          },
        },
      };
    case "dropdown":
      return {
        [nodeName]: {
          group: fieldGroupName,
          atom: true,
          toDOM: getDefaultToDOMForLeafNode(nodeName),
          parseDOM: getDefaultParseDOMForLeafNode(nodeName),
          attrs: {
            fields: {
              default: field.defaultValue,
            },
          },
        },
      };
    case "custom":
      return {
        [nodeName]: {
          group: fieldGroupName,
          atom: true,
          toDOM: getDefaultToDOMForLeafNode(nodeName),
          parseDOM: getDefaultParseDOMForLeafNode(nodeName),
          attrs: {
            fields: {
              default: { value: field.defaultValue },
            },
          },
        },
      };
  }
};

const createGetAttrsForTextNode = (nodeName: string) => (dom: Element) => {
  const domFieldName = dom.getAttribute(fieldNameAttr);

  if (domFieldName !== nodeName) {
    return false;
  }

  return undefined;
};

const getDefaultToDOMForContentNode = (nodeName: string) => () =>
  [
    "div",
    {
      [fieldNameAttr]: nodeName,
    },
    0,
  ] as const;

const getDefaultToDOMForLeafNode = (nodeName: string) => (node: Node) => [
  "div",
  {
    [fieldNameAttr]: nodeName,
    fields: JSON.stringify(node.attrs.fields),
  },
];

const getDefaultParseDOMForLeafNode = (nodeName: string) => [
  {
    tag: "div",
    getAttrs: (dom: Element) => {
      const domFieldName = dom.getAttribute(fieldNameAttr);
      if (domFieldName !== nodeName) {
        return false;
      }

      const attrs = {
        fields: JSON.parse(dom.getAttribute("fields") ?? "{}") as unknown,
      };

      return attrs;
    },
  },
];

export const createNodesForFieldValues = <
  S extends Schema,
  FDesc extends FieldDescriptions<string>
>(
  schema: S,
  fieldDescriptions: FDesc,
  fieldValues: Partial<FieldNameToValueMap<FDesc>>,
  elementName: string
): Node[] => {
  const orderedFieldNames = getDeterministicFieldOrder(
    Object.keys(fieldDescriptions)
  );

  return orderedFieldNames.map((fieldName) => {
    const field = fieldDescriptions[fieldName];
    const fieldView = fieldTypeToViewMap[field.type];
    const nodeType = schema.nodes[getNodeNameFromField(fieldName, elementName)];
    const fieldValue =
      fieldValues[fieldName] ?? // The value supplied when the element is inserted
      fieldDescriptions[fieldName].defaultValue ?? // The default value supplied by the element field spec
      fieldTypeToViewMap[field.type].defaultValue; // The default value supplied by the FieldView

    if (fieldView.fieldType === "CONTENT") {
      const content = fieldValue as string;

      return field.type === "richText"
        ? createContentNodeFromRichText(
            schema,
            content,
            nodeType.create({ type: field.type })
          )
        : createContentNodeFromText(content, field, nodeType);
    } else {
      return nodeType.create({ type: field.type, fields: fieldValue });
    }
  });
};

const createContentNodeFromText = (
  content: string,
  fieldDesc: FieldDescription,
  nodeType: NodeType<Schema>
) =>
  nodeType.create(
    { type: fieldDesc.type },
    content ? nodeType.schema.text(content) : undefined
  );

const createContentNodeFromRichText = <S extends Schema>(
  schema: S,
  fieldValue: string,
  topNode: Node
) => {
  const parser = DOMParser.fromSchema(schema);
  const element = document.createElement("div");
  element.innerHTML = fieldValue;
  return parser.parse(element, {
    topNode,
    preserveWhitespace: false,
  });
};

/**
 * It doesn't really matter which order we add our fields to our NodeSpec –
 * but it does matter that we reliably match the order we create them to the
 * order that they're added to the schema. This function gives us a fixed order.
 */
export const getDeterministicFieldOrder = (fieldNames: string[]): string[] =>
  fieldNames.slice().sort();

export const getNodeNameFromField = (fieldName: string, elementName: string) =>
  `${elementName}_${fieldName}`;

export const getFieldNameFromNode = (node: Node) =>
  node.type.name.split("_")[1];
