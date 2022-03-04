import OrderedMap from "orderedmap";
import type { Node, NodeSpec, NodeType, Schema } from "prosemirror-model";
import { DOMParser } from "prosemirror-model";
import { FieldType } from "./fieldViews/FieldView";
import {
  repeaterFieldName,
  RepeaterFieldView,
} from "./fieldViews/RepeaterFieldView";
import type { FieldNameToValueMap } from "./helpers/fieldView";
import { fieldTypeToViewMap } from "./helpers/fieldView";
import type { FieldDescription, FieldDescriptions } from "./types/Element";

// An attribute added to Element nodes to identify them as such.
export const elementNodeAttr = "isProseMirrorElement";
export const elementSelectedNodeAttr = "isSelected";

export const elementTypeAttr = "pme-element-type";
export const elementSelectedAttr = "pme-element-selected";
export const fieldNameAttr = "pme-field-name";

export const getNodeSpecFromFieldDescriptions = <
  FDesc extends FieldDescriptions<string>
>(
  elementName: string,
  groupName: string,
  fieldDescriptions: FDesc
): OrderedMap<NodeSpec> => {
  const nodeName = getNodeNameFromElementName(elementName);
  const propSpecs = Object.entries(fieldDescriptions).reduce(
    (acc, [fieldName, propSpec]) =>
      acc.append(getNodeSpecForField(nodeName, fieldName, propSpec)),
    OrderedMap.from<NodeSpec>({})
  );

  return propSpecs.append(
    getNodeSpecForElement(nodeName, groupName, fieldDescriptions)
  );
};

const getNodeSpecForElement = (
  nodeName: string,
  groupName: string,
  fieldDescription: FieldDescriptions<string>
): NodeSpec => ({
  [nodeName]: {
    defining: true,
    group: groupName,
    content: getDeterministicFieldOrder(
      Object.keys(fieldDescription).map((fieldName) =>
        getNodeNameFromField(fieldName, nodeName)
      )
    ).join(" "),
    attrs: {
      [elementNodeAttr]: { default: true },
      [elementSelectedNodeAttr]: { default: false },
      type: nodeName,
      // Used to determine which nodes should receive update decorations, which force them to update when the document changes. See `createUpdateDecorations` in prosemirror.ts.
      addUpdateDecoration: { default: true },
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
          if (domElementName !== nodeName) {
            return false;
          }

          return {
            type: nodeName,
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
          marks: field.marks,
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
    case "repeater": {
      const extraFields = Object.entries(field.fields).reduce<NodeSpec>(
        (acc, [nestedFieldName, nestedField]) => ({
          ...acc,
          ...getNodeSpecForField(elementName, nestedFieldName, nestedField),
        }),
        {}
      );

      // The repeater nodes content will be these fields, in order
      const content = getDeterministicFieldOrder(Object.keys(extraFields)).join(
        " "
      );

      return {
        [nodeName]: {
          group: fieldGroupName,
          content,
          toDOM: getDefaultToDOMForLeafNode(nodeName),
          parseDOM: getDefaultParseDOMForLeafNode(nodeName),
          attrs: {},
        },
        ...extraFields,
      };
    }
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
  nodeName: string
): Node[] => {
  const orderedFieldNames = getDeterministicFieldOrder(
    Object.keys(fieldDescriptions)
  );

  return orderedFieldNames.flatMap((fieldName) => {
    const field = fieldDescriptions[fieldName];
    const fieldView = fieldTypeToViewMap[field.type];
    const nodeNameForField = getNodeNameFromField(fieldName, nodeName);
    const nodeType = schema.nodes[nodeNameForField];
    console.log({ nodeNameForField });
    if (fieldView === RepeaterFieldView && field.type === "repeater") {
      const fieldValueArray = fieldValues[fieldName];
      return fieldValueArray.flatMap((nestedFieldValues) => {
        const childNodes = createNodesForFieldValues(
          schema,
          field.fields,
          nestedFieldValues,
          nodeName
        );

        const repeaterNode = createRepeaterNode(
          schema,
          childNodes,
          fieldName,
          nodeName
        );

        if (!repeaterNode) {
          throw new Error(
            "Failed to create repeater node",
            childNodes,
            fieldName,
            nodeName
          );
        }

        return repeaterNode;
      });
    }

    if (
      !(fieldView === RepeaterFieldView) &&
      field.type !== repeaterFieldName
    ) {
      const fieldValue =
        fieldValues[fieldName] ?? // The value supplied when the element is inserted
        fieldDescriptions[fieldName].defaultValue ?? // The default value supplied by the element field spec
        fieldView.defaultValue; // The default value supplied by the FieldView

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
    }

    console.log(
      fieldView === RepeaterFieldView,
      field.type !== repeaterFieldName,
      fieldView,
      field.type
    );
    throw new Error(`Cannot create node for ${fieldName}`);
  });
};

const createRepeaterNode = (
  schema: Schema,
  nodes: Node[],
  fieldName: string,
  nodeName: string
): Node | undefined => {
  const nodeNameForField = getNodeNameFromField(fieldName, nodeName);
  const nodeType = schema.nodes[nodeNameForField];
  console.log({ type: nodeNameForField }, nodes);
  return nodeType.createAndFill({ type: nodeNameForField }, nodes) ?? undefined;
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

export const getNodeNameFromField = (fieldName: string, nodeName: string) =>
  `${nodeName}__${fieldName}`;

export const getFieldNameFromNode = (node: Node) => {
  try {
    return node.type.name.split("__")[1];
  } catch (e) {
    console.log(node);
    throw new Error("wups");
  }
};

/**
 * Node names must not include hyphens, as they're a reserved character in the content spec,
 * so we convert them to underscores on ingress, and back on egress.
 */

export const getNodeNameFromElementName = (elementName: string) =>
  elementName.replaceAll("-", "_");

export const getElementNameFromNode = (node: Node) =>
  node.type.name.replaceAll("_", "-");

export const isProseMirrorElement = (node: Node): boolean =>
  node.attrs[elementNodeAttr] === true;

export const isProseMirrorElementSelected = (node: Node): boolean =>
  node.attrs[elementSelectedNodeAttr] === true;
