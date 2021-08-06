import type { DOMSerializer, Node, Schema } from "prosemirror-model";
import { fieldTypeToViewMap } from "../fieldViews/helpers";
import { createNodesForFieldValues, getFieldNameFromNode } from "../nodeSpec";
import type {
  ElementSpecMap,
  ExtractFieldValues,
  FieldNameToFieldViewSpec,
  FieldSpec,
} from "../types/Element";

export const createGetNodeFromElementData = <
  FSpec extends FieldSpec<keyof FSpec>,
  ElementNames extends keyof ESpecMap,
  ElementName extends ElementNames,
  ESpecMap extends ElementSpecMap<FSpec, ElementNames>
>(
  elementTypeMap: ESpecMap
) => (
  elementName: ElementName,
  fieldValues: ExtractFieldValues<ESpecMap[ElementName]> = {},
  schema: Schema
) => {
  const element = elementTypeMap[elementName];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we cannot be sure the schema has been amended
  if (!schema.nodes[elementName]) {
    throw new Error(
      `[prosemirror-elements]: ${elementName} is not included in the state schema. Did you add the NodeSpec generated by this plugin to the schema?`
    );
  }

  const nodes = createNodesForFieldValues(
    schema,
    element.fieldSpec,
    fieldValues,
    elementName
  );

  return schema.nodes[elementName].createAndFill(
    {
      type: elementName,
    },
    nodes
  );
};

export const createGetElementDataFromNode = <
  FSpec extends FieldSpec<keyof FSpec>,
  ElementNames extends keyof ESpecMap,
  ESpecMap extends ElementSpecMap<FSpec, ElementNames>
>(
  elementTypeMap: ESpecMap
) => (node: Node, serializer: DOMSerializer) => {
  const nodeType = node.attrs.type as ElementNames;
  const elementSpec = elementTypeMap[nodeType];

  // We gather the values from each child as we iterate over the
  // node, to update the renderer. It's difficult to be typesafe here,
  // as the Node's name value is loosely typed as `string`, and so we
  // cannot index into the element `fieldSpec` to discover the appropriate type.
  const fieldValues: Record<string, unknown> = {};
  node.forEach((node) => {
    const fieldName = getFieldNameFromNode(
      node
    ) as keyof FieldNameToFieldViewSpec<FSpec>;
    const fieldSpec = elementSpec.fieldSpec[fieldName];
    const fieldType = fieldTypeToViewMap[fieldSpec.type].fieldType;

    fieldValues[fieldName] =
      fieldType === "ATTRIBUTES"
        ? getValuesFromAttributeNode(node)
        : getValuesFromContentNode(node, serializer);
  });

  return fieldValues as ExtractFieldValues<ESpecMap[ElementNames]>;
};

const getValuesFromAttributeNode = (node: Node) => node.attrs.fields as unknown;

const getValuesFromContentNode = (node: Node, serializer: DOMSerializer) => {
  const dom = serializer.serializeFragment(node.content);
  const e = document.createElement("div");
  e.appendChild(dom);
  return e.innerHTML;
};
