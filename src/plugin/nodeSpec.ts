import OrderedMap from "orderedmap";
import type { Node, NodeSpec, NodeType, Schema } from "prosemirror-model";
import { DOMParser } from "prosemirror-model";
import { useTyperighterAttrs } from "../elements/helpers/typerighter";
import { FieldContentType } from "./fieldViews/FieldView";
import type { RepeaterFieldDescription } from "./fieldViews/RepeaterFieldView";
import {
  getRepeaterChildNodeName,
  getRepeaterParentNodeName,
  repeaterFieldType,
} from "./fieldViews/RepeaterFieldView";
import { RepeaterFieldMapIDKey } from "./helpers/constants";
import type {
  ExternalElementData,
  GetNodeFromElementData,
  TransformElementIn,
} from "./helpers/element";
import type { FieldNameToValueMap } from "./helpers/fieldView";
import { fieldTypeToViewMap } from "./helpers/fieldView";
import { getRepeaterID } from "./helpers/util";
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
    content: getContentStringFromFields(fieldDescription, nodeName),
    attrs: {
      [elementNodeAttr]: { default: true },
      [elementSelectedNodeAttr]: { default: false },
      // Used to determine which nodes should receive update decorations, which force them to update when the document changes. See `createUpdateDecorations` in prosemirror.ts.
      addUpdateDecoration: { default: true },
      type: { default: nodeName },
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
    case "nestedElement": {
      return {
        [nodeName]: {
          group: `${fieldGroupName} nested-element-field`,
          content: field.content ?? "element+",
          toDOM: getDefaultToDOMForContentNode(nodeName),
          parseDOM: [
            {
              tag: "div",
              getAttrs: createGetAttrsForTextNode(nodeName),
              preserveWhitespace: false,
            },
          ],
          marks: field.marks,
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
              default: field.defaultValue,
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

      const content = getContentStringFromFields(field.fields, elementName);
      const parentNodeName = getRepeaterParentNodeName(nodeName);
      const childNodeName = getRepeaterChildNodeName(nodeName);

      return {
        [parentNodeName]: {
          group: fieldGroupName,
          content: `${childNodeName}{${field.minChildren},}`,
          toDOM: getDefaultToDOMForRepeaterNode(parentNodeName),
          parseDOM: getDefaultParseDOMForLeafNode(parentNodeName),
          attrs: { ...useTyperighterAttrs },
        },
        [childNodeName]: {
          group: fieldGroupName,
          content,
          toDOM: getDefaultToDOMForRepeaterNode(childNodeName),
          parseDOM: getDefaultParseDOMForRepeaterChildNode(childNodeName),
          attrs: {
            [RepeaterFieldMapIDKey]: {
              default: getRepeaterID(),
            },
            ...useTyperighterAttrs,
          },
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

const getDefaultToDOMForRepeaterNode = (nodeName: string) => () => [
  "div",
  {
    [fieldNameAttr]: nodeName,
  },
  0,
];

const getDefaultParseDOMForRepeaterChildNode = (nodeName: string) => [
  {
    tag: "div",
    getAttrs: (dom: Element) => {
      const domFieldName = dom.getAttribute(fieldNameAttr);
      if (domFieldName !== nodeName) {
        return false;
      }

      return {
        [RepeaterFieldMapIDKey]: getRepeaterID(),
      };
    },
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
  nodeName: string,
  getNodeFromElementData: GetNodeFromElementData,
  transformElementIn?: TransformElementIn
): Node[] => {
  const orderedFieldNames = getDeterministicFieldOrder(
    Object.keys(fieldDescriptions)
  );

  return orderedFieldNames.flatMap((fieldName) => {
    const field = fieldDescriptions[fieldName];
    const fieldView = fieldTypeToViewMap[field.type];
    const baseNodeName = getNodeNameFromField(fieldName, nodeName);
    const nodeType =
      field.type === "repeater"
        ? schema.nodes[getRepeaterParentNodeName(baseNodeName)]
        : schema.nodes[baseNodeName];
    const fieldValue =
      fieldValues[fieldName] ?? // The value supplied when the element is inserted
      fieldDescriptions[fieldName].defaultValue ?? // The default value supplied by the element field spec
      fieldTypeToViewMap[field.type].defaultValue; // The default value supplied by the FieldView

    switch (fieldView.fieldContentType) {
      case FieldContentType.CONTENT: {
        let content = fieldValue as string;

        return [
          field.type === "richText"
            ? createContentNodeFromRichText(
                schema,
                content,
                nodeType.create({ type: field.type })
              )
            : createContentNodeFromText(content, field, nodeType),
        ];
      }
      case FieldContentType.ATTRIBUTES: {
        return [nodeType.create({ type: field.type, fields: fieldValue })];
      }
      case FieldContentType.REPEATER: {
        const content = fieldValue as unknown[];
        const node = createRepeaterNode(
          content,
          field as RepeaterFieldDescription<FieldDescriptions<string>>,
          nodeType,
          schema.nodes[getRepeaterChildNodeName(baseNodeName)],
          nodeName,
          getNodeFromElementData,
          transformElementIn
        );

        if (!node) {
          throw new Error(
            `[prosemirror-elements]: Could not create repeater node for field of type ${fieldName}`
          );
        }

        return node;
      }
      case FieldContentType.NESTED: {
        const content = fieldValue as unknown[];
        const node = createNestedElementNode(
          content,
          field,
          nodeType,
          schema,
          getNodeFromElementData,
          transformElementIn
        );

        if (!node) {
          console.log({ content, field, nodeType, nodeName });
          throw new Error(
            `[prosemirror-elements]: Could not create nested element node for field of type ${fieldName}`
          );
        }

        return node;
      }
    }
  });
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

const isExternalData = (element: unknown): element is ExternalElementData => {
  if (isRecord(element)) {
    const { elementType, fields } = element;
    if (typeof elementType === "string" && isRecord(fields)) {
      return true;
    }
  }
  return false;
};

const createNestedElementNode = (
  elementsArray: unknown[],
  fieldDesc: FieldDescription,
  nestedElementFieldNodeType: NodeType,
  schema: Schema,
  getNodeFromElementData: GetNodeFromElementData,
  transformElementIn?: TransformElementIn
): Node | null | undefined => {
  const childNodes = elementsArray
    .map((element) => {
      if (isExternalData(element)) {
        const externalElement = element;
        const elementName = externalElement.elementType;

        const values = transformElementIn
          ? transformElementIn(elementName, externalElement)
          : {
              ...externalElement.fields,
              assets: externalElement.assets,
            };

        const transformedElementData = {
          elementName,
          values,
        };

        if (elementName === "textElement") {
          const emptyTextElementNode = schema.nodes["textElement"].create({
            flexElement: null,
          });

          const richTextNode = createContentNodeFromRichText(
            schema,
            externalElement.fields.text,
            emptyTextElementNode
          );
          return richTextNode;
        }
        const elementNode = getNodeFromElementData(
          transformedElementData,
          schema
        );
        return elementNode;
      }
    })
    .filter((node) => !!node);

  return nestedElementFieldNodeType.createAndFill(
    {
      type: fieldDesc.type,
    },
    childNodes as Node[]
  );
};

const createRepeaterNode = <
  Name extends string,
  FDesc extends FieldDescriptions<Name>
>(
  valuesArray: unknown[],
  fieldDesc: RepeaterFieldDescription<FDesc>,
  parentNodeType: NodeType,
  childNodeType: NodeType,
  nodeName: string,
  getNodeFromElementData: GetNodeFromElementData,
  transformElementIn?: TransformElementIn
): Node | null | undefined => {
  const childNodes = valuesArray.map((fieldValues) => {
    const fieldNodes = createNodesForFieldValues(
      parentNodeType.schema,
      fieldDesc.fields,
      fieldValues as Partial<FieldNameToValueMap<FDesc>>,
      nodeName,
      getNodeFromElementData,
      transformElementIn
    );
    return childNodeType.createAndFill(
      { type: fieldDesc.type, [RepeaterFieldMapIDKey]: getRepeaterID() },
      fieldNodes
    ) as Node;
  });

  return parentNodeType.createAndFill(
    {
      type: fieldDesc.type,
    },
    childNodes
  );
};

const createContentNodeFromText = (
  content: string,
  fieldDesc: FieldDescription,
  nodeType: NodeType
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

export const getContentStringFromFields = (
  fieldDesc: FieldDescriptions<string>,
  nodeName: string
): string =>
  getDeterministicFieldOrder(
    Object.keys(fieldDesc).map(
      (fieldName) =>
        `${getNodeNameFromField(fieldName, nodeName)}${
          fieldDesc[fieldName].type === repeaterFieldType ? "__parent" : ""
        }`
    )
  ).join(" ");

/**
 * It doesn't really matter which order we add our fields to our NodeSpec –
 * but it does matter that we reliably match the order we create them to the
 * order that they're added to the schema. This function gives us a fixed order.
 */
export const getDeterministicFieldOrder = (fieldNames: string[]): string[] =>
  fieldNames.slice().sort();

export const getNodeNameFromField = (fieldName: string, nodeName: string) =>
  `${nodeName}__${fieldName}`;

export const getFieldNameFromNode = (node: Node) =>
  node.type.name.split("__")[1];

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
