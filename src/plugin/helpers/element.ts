import _ from "lodash";
import type {
  DOMSerializer,
  Node,
  ResolvedPos,
  Schema,
} from "prosemirror-model";
import type { FieldValidationErrors } from "../elementSpec";
import {
  createNodesForFieldValues,
  getElementNameFromNode,
  getFieldNameFromNode,
  getNodeNameFromElementName,
  isProseMirrorElement,
} from "../nodeSpec";
import type {
  ElementSpecMap,
  ExtractDataTypeFromElementSpec,
  ExtractFieldValues,
  FieldDescription,
  FieldDescriptions,
  FieldNameToField,
} from "../types/Element";
import type { FieldNameToValueMap } from "./fieldView";
import { fieldTypeToViewMap } from "./fieldView";

type ExternalElementData = {
  elementType: string;
  values: {
    fields: unknown,
    assets: unknown
  }
}

type InternalElementDataValues = {
  fields: unknown,
  assets: unknown
}

type InternalElementData = {
  elementName: string;
  values: InternalElementDataValues
}

export type TransformElementIn = (elementName: string, values: unknown) => unknown
export type TransformElementOut = (elementName: string | number | symbol, values: unknown) => InternalElementDataValues


/**
 * Creates a function that will attempt to create a Prosemirror node from
 * the given element data. If it does not recognise the element type,
 * returns undefined.
 */
export const createGetNodeFromElementData = <
  FDesc extends FieldDescriptions<Extract<keyof FDesc, string>>,
  ElementNames extends Extract<keyof ESpecMap, string>,
  ESpecMap extends ElementSpecMap<FDesc, ElementNames>
>(
  elementTypeMap: ESpecMap
) => (
  {
    elementName,
    values,
    transformElementIn
  }: {
    elementName: string;
    values: unknown;
    transformElementIn?: (elementName: string, values: unknown) => unknown
  },
  schema: Schema
) => {
  const getNodeFromElementData = createGetNodeFromElementData(elementTypeMap);
  const element = elementTypeMap[elementName as keyof ESpecMap];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this may be falsy.
  if (!element) {
    return undefined;
  }

  const nodeName = getNodeNameFromElementName(elementName);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we cannot be sure the schema has been amended
  if (!schema.nodes[nodeName]) {
    throw new Error(
      `[prosemirror-elements]: ${elementName} is not included in the state schema. Did you add the NodeSpec generated by this plugin to the schema?`
    );
  }

  const nodes: Node[] = createNodesForFieldValues(
    schema,
    element.fieldDescriptions,
    values as FieldNameToValueMap<FDesc>,
    nodeName,
    getNodeFromElementData,
    transformElementIn
  );

  return schema.nodes[nodeName].createAndFill(
    {
      type: nodeName,
    },
    nodes
  );
};

export type GetElementDataFromNode<ElementNames, ESpecMap> = (
  node: Node,
  serializer: DOMSerializer,
  transformElementOut?: TransformElementOut
) => (ExtractDataTypeFromElementSpec<ESpecMap, ElementNames> | undefined);

/**
 * Creates a function that will attempt to extract element data from
 * the given node. If it does not recognise the node as an element,
 * returns undefined.
 */
export const createGetElementDataFromNode = <
  FDesc extends FieldDescriptions<Extract<keyof FDesc, string>>,
  ElementNames extends Extract<keyof ESpecMap, string>,
  ESpecMap extends ElementSpecMap<FDesc, ElementNames>
>(
  elementTypeMap: ESpecMap
): GetElementDataFromNode<ElementNames, ESpecMap> => (node: Node, serializer: DOMSerializer, transformElementOut?: TransformElementOut) => {
  const elementName = getElementNameFromNode(node) as ElementNames;
  const element = elementTypeMap[elementName];
  const getElementDataFromNode = createGetElementDataFromNode(elementTypeMap);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this may be truthy.
  if (!element) {
    return undefined;
  }

  const values = getFieldValuesFromNode(
    node,
    element.fieldDescriptions,
    serializer,
    getElementDataFromNode,
    transformElementOut
  );

  return ({
    elementName,
    values,
  } as unknown) as ExtractDataTypeFromElementSpec<ESpecMap, ElementNames>;
};

export const getFieldValuesFromNode = <
  FDesc extends FieldDescriptions<Extract<keyof FDesc, string>>,
  ElementNames,
  ESpecMap
>(
  node: Node,
  fieldDescriptions: FDesc,
  serializer: DOMSerializer,
  getElementDataFromNode: GetElementDataFromNode<ESpecMap, ElementNames>,
  transformElementOut?: TransformElementOut
) => {
  // We gather the values from each child as we iterate over the
  // node, to update the renderer. It's difficult to be typesafe here,
  // as the Node's name value is loosely typed as `string`, and so we
  // cannot index into the element `fieldDescriptions` to discover the appropriate type.
  const values: Record<string, unknown> = {};
  node.forEach((node) => {
    const fieldName = getFieldNameFromNode(
      node
    ) as keyof FieldNameToField<FDesc>;
    const fieldDescription = fieldDescriptions[fieldName];
    const value = getFieldValueFromNode(
      node,
      fieldDescription,
      serializer,
      getElementDataFromNode,
      transformElementOut,
    );

    if (
      (fieldDescription.type === "richText" ||
        fieldDescription.type === "text") &&
      fieldDescription.absentOnEmpty &&
      !node.textContent
    ) {
      return;
    }

    values[fieldName] = value;
  });

  return values as ExtractFieldValues<FDesc>;
};

export const getFieldValueFromNode = <
  FDesc extends FieldDescriptions<Extract<keyof FDesc, string>>,
  ElementNames,
  ESpecMap
>(
  node: Node,
  fieldDescription: FieldDescription,
  serializer: DOMSerializer,
  getElementDataFromNode: GetElementDataFromNode<ESpecMap, ElementNames>,
  transformElementOut?: TransformElementOut
): unknown => {
  const fieldType = fieldTypeToViewMap[fieldDescription.type].fieldContentType;
  if (fieldType === "ATTRIBUTES") {
    return getValuesFromAttributeNode(node);
  }
  if (fieldDescription.type === "richText") {
    return getValuesFromRichContentNode(node, serializer);
  }
  if (fieldDescription.type === "text") {
    return getValuesFromTextContentNode(node);
  }
  if (fieldDescription.type === "repeater") {
    const values = [] as unknown[];
    node.forEach((childNode) => {
      values.push(
        getFieldValuesFromNode(
          childNode,
          fieldDescription.fields,
          serializer,
          getElementDataFromNode,
          transformElementOut,
        )
      );
    });
    return values;
  }
  if (fieldDescription.type === "nestedElement") {
    return getValuesFromNestedElementContentNode(
      node,
      serializer,
      getElementDataFromNode,
      transformElementOut,
    );
  }
  return undefined;
};

const getValuesFromAttributeNode = (node: Node) => node.attrs.fields as unknown;

const getValuesFromRichContentNode = (
  node: Node,
  serializer: DOMSerializer
) => {
  const dom = serializer.serializeFragment(node.content);
  const e = document.createElement("div");
  e.appendChild(dom);
  return e.innerHTML;
};

const getValuesFromTextContentNode = (node: Node) => node.textContent;

const getValuesFromNestedElementContentNode = <
  FDesc extends FieldDescriptions<Extract<keyof FDesc, string>>,
  ElementNames,
  ESpecMap
>(
  node: Node,
  serializer: DOMSerializer,
  getElementDataFromNode: GetElementDataFromNode<ESpecMap, ElementNames>,
  transformElementOut?: TransformElementOut,
) => {
  const nestedElements: Array<
    ExtractDataTypeFromElementSpec<ESpecMap, Extract<keyof ESpecMap, string>>
  > = [];
  node.forEach((childElement) => {
    const elementName = getElementNameFromNode(childElement) as
      | ElementNames
      | "textElement";
    if (elementName === "textElement") {
      // Make sure the nestedElementField serialises any textElement properly,
      // rather than throwing them away on serialisation.
      const emptyElement = {
        elementType: "textElement",
        fields: {},
        assets: [],
      };

      const dom = serializer.serializeFragment(childElement.content);
      const e = document.createElement("div");
      e.appendChild(dom);

      if (childElement.textContent) {
        const nestedNode = _.assign(_.cloneDeep(emptyElement), {
          fields: {
            text: e.innerHTML,
          },
        });
        // This is a textElement as defined in flexible-content, not within the scope of
        // prosemirror-elements, so we need to do a type-cast to make Typescript happy.
        // Currently, the top level textElements will be serialised by flexible-content,
        // so we're duplicating some functionality here. In the future it would be better
        // to have prosemirror-elements handle textElements everywhere they appear, but
        // that will be a substantial change in both projects.
        nestedElements.push(
          (nestedNode as unknown) as ExtractDataTypeFromElementSpec<
            ESpecMap,
            Extract<keyof ESpecMap, string>
          >
        );
      }
    } else {
      const elementData = getElementDataFromNode(childElement, serializer, transformElementOut);

      if (!elementData){
        return undefined
      }

      const internalElementData = transformElementOut ? {
          elementName: elementData.elementName,
          values: transformElementOut(
              elementData.elementName,
              elementData.values
          )
        } : elementData
     
      const externalElementData = {
        elementType: internalElementData.elementName,
        fields: internalElementData.values.fields,
        assets: internalElementData.values.assets
      }

      nestedElements.push((externalElementData as unknown) as ExtractDataTypeFromElementSpec<
        ESpecMap,
        Extract<keyof ESpecMap, string>
      >);
    }
  });
  
  return nestedElements;
};

export const createElementDataValidator = <
  FDesc extends FieldDescriptions<Extract<keyof FDesc, string>>,
  ElementNames extends Extract<keyof ESpec, string>,
  ESpec extends ElementSpecMap<FDesc, ElementNames>
>(
  elementTypeMap: ESpec
) => ({
  elementName,
  values,
}: ExtractDataTypeFromElementSpec<ESpec, ElementNames>):
  | FieldValidationErrors
  | undefined => {
  const element = elementTypeMap[elementName];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this may be falsy.
  if (!element) {
    return undefined;
  }

  const data = (values as unknown) as FieldNameToValueMap<FDesc>;

  return element.validate(data);
};

/**
 * If the position given is within an element, find a valid position to insert an element.
 * Otherwise, return `undefined`;
 */
export const findValidInsertPositionWithinElement = (
  $pos: ResolvedPos
): number | undefined => {
  const depth = $pos.depth;
  const node = $pos.node(depth);

  if (isProseMirrorElement(node)) {
    return $pos.pos;
  } else if (depth > 0) {
    const newPos = $pos.doc.resolve($pos.end(depth - 1));
    return findValidInsertPositionWithinElement(newPos);
  } else {
    return undefined;
  }
};
