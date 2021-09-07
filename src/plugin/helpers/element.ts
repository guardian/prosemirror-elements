import type { DOMSerializer, Node, Schema } from "prosemirror-model";
import type { FieldNameToValueMap } from "../fieldViews/helpers";
import { fieldTypeToViewMap } from "../fieldViews/helpers";
import { createNodesForFieldValues, getFieldNameFromNode } from "../nodeSpec";
import type {
  ElementSpecMap,
  ExtractDataTypeFromElementSpec,
  ExtractFieldValues,
  FieldDescriptions,
  FieldNameToField,
} from "../types/Element";

/**
 * Creates a function that will attempt to create a Prosemirror node from
 * the given element data. If it does not recognise the element type,
 * returns undefined.
 */
export const createGetNodeFromElementData = <
  FDesc extends FieldDescriptions<keyof FDesc>,
  ElementNames extends keyof ESpecMap,
  ExternalData,
  ESpecMap extends ElementSpecMap<FDesc, ElementNames, ExternalData>
>(
  elementTypeMap: ESpecMap
) => (
  {
    elementName,
    values,
  }: {
    elementName: string;
    values: unknown;
  },
  schema: Schema
) => {
  const element = elementTypeMap[elementName as keyof ESpecMap];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this may be falsy.
  if (!element) {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we cannot be sure the schema has been amended
  if (!schema.nodes[elementName]) {
    throw new Error(
      `[prosemirror-elements]: ${elementName} is not included in the state schema. Did you add the NodeSpec generated by this plugin to the schema?`
    );
  }

  const transformedValues =
    element.transformers?.transformElementDataIn(values as ExternalData) ??
    values;

  const nodes = createNodesForFieldValues(
    schema,
    element.fieldDescriptions,
    transformedValues as FieldNameToValueMap<FDesc>,
    elementName
  );

  return schema.nodes[elementName].createAndFill(
    {
      type: elementName,
    },
    nodes
  );
};

/**
 * Creates a function that will attempt to extract element data from
 * the given node. If it does not recognise the node as an element,
 * returns undefined.
 */
export const createGetElementDataFromNode = <
  FDesc extends FieldDescriptions<keyof FDesc>,
  ElementNames extends keyof ESpecMap,
  ExternalData,
  ESpecMap extends ElementSpecMap<FDesc, ElementNames, ExternalData>
>(
  elementTypeMap: ESpecMap
) => (node: Node, serializer: DOMSerializer) => {
  const elementName = node.attrs.type as ElementNames;
  const element = elementTypeMap[elementName];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this may be falsy.
  if (!element) {
    return undefined;
  }

  // We gather the values from each child as we iterate over the
  // node, to update the renderer. It's difficult to be typesafe here,
  // as the Node's name value is loosely typed as `string`, and so we
  // cannot index into the element `fieldDescriptions` to discover the appropriate type.
  const values: Record<string, unknown> = {};
  node.forEach((node) => {
    const fieldName = getFieldNameFromNode(
      node
    ) as keyof FieldNameToField<FDesc>;
    const fieldDescriptions = element.fieldDescriptions[fieldName];
    const fieldType = fieldTypeToViewMap[fieldDescriptions.type].fieldType;

    values[fieldName] =
      fieldType === "ATTRIBUTES"
        ? getValuesFromAttributeNode(node)
        : getValuesFromContentNode(node, serializer);
  });

  return ({
    elementName,
    values:
      element.transformers?.transformElementDataOut(
        values as ExtractFieldValues<typeof element>
      ) ?? values,
  } as unknown) as ExtractDataTypeFromElementSpec<ESpecMap, ElementNames>;
};

const getValuesFromAttributeNode = (node: Node) => node.attrs.fields as unknown;

const getValuesFromContentNode = (node: Node, serializer: DOMSerializer) => {
  const dom = serializer.serializeFragment(node.content);
  const e = document.createElement("div");
  e.appendChild(dom);
  return e.innerHTML;
};

export const createElementDataValidator = <
  FDesc extends FieldDescriptions<keyof FDesc>,
  ElementNames extends keyof ESpecMap,
  ExternalData,
  ESpecMap extends ElementSpecMap<FDesc, ElementNames, ExternalData>
>(
  elementTypeMap: ESpecMap
) => (
  elementName: keyof ESpecMap,
  values: unknown
): Record<string, string[]> | undefined => {
  const element = elementTypeMap[elementName];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this may be falsy.
  if (!element) {
    return undefined;
  }

  return element.validate(values as FieldNameToValueMap<FDesc>);
};
