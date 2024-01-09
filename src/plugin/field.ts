import { set } from "lodash/fp";
import type { DOMSerializer, Node } from "prosemirror-model";
import type { DecorationSource, EditorView } from "prosemirror-view";
import { RepeaterFieldMapIDKey } from "./helpers/constants";
import { getFieldValueFromNode } from "./helpers/element";
import { getElementFieldViewFromType } from "./helpers/fieldView";
import { validateValue } from "./helpers/validation";
import { getFieldNameFromNode } from "./nodeSpec";
import type {
  Field,
  FieldDescriptions,
  FieldNameToField,
  RepeaterField,
} from "./types/Element";
import { isRepeaterField } from "./types/Element";

type GetFieldsFromNodeOptions<FDesc extends FieldDescriptions<string>> = {
  node: Node;
  fieldDescriptions: FDesc;
  view: EditorView;
  getPos: () => number;
  innerDecos: DecorationSource;
  serializer: DOMSerializer;
  offset?: number;
};

/**
 * Get the fields for an element from a Node representing that element in Prosemirror.
 */
export const getFieldsFromNode = <FDesc extends FieldDescriptions<string>>({
  node,
  fieldDescriptions,
  view,
  getPos,
  innerDecos,
  serializer,
  offset = 0,
}: GetFieldsFromNodeOptions<FDesc>): FieldNameToField<FDesc> => {
  const fields = {} as FieldNameToField<FDesc>;
  if (node.attrs[RepeaterFieldMapIDKey]) {
    applyFieldUUIDToObject(fields, node.attrs[RepeaterFieldMapIDKey]);
  }

  // If our node has a repeater UID attached, add it to the field.
  // These UIDs are present on repeater child nodes.
  if (node.attrs[RepeaterFieldMapIDKey]) {
    (fields as Record<string, unknown>)[RepeaterFieldMapIDKey] =
      node.attrs[RepeaterFieldMapIDKey];
  }

  node.forEach((fieldNode, localOffset) => {
    const fieldName = getFieldNameFromNode(
      fieldNode
    ) as keyof FieldNameToField<FDesc>;
    const fieldDescription = fieldDescriptions[fieldName];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- strictly, we should check.
    if (!fieldDescription) {
      throw new Error(
        getErrorMessageForAbsentField(fieldName, Object.keys(fieldDescriptions))
      );
    }

    const fieldView = getElementFieldViewFromType(fieldName, fieldDescription, {
      node: fieldNode,
      view,
      getPos,
      offset: offset + localOffset,
      innerDecos,
    });

    if (fieldDescription.type === "repeater") {
      const children = [] as unknown[];
      fieldNode.forEach((repeaterChildNode, repeaterOffset) => {
        // We offset by two positions here to account for the additional depth
        // of the parent and child repeater nodes.
        const depthOffset = 2;
        const child = getFieldsFromNode({
          node: repeaterChildNode,
          fieldDescriptions: fieldDescription.fields,
          view,
          getPos,
          innerDecos,
          serializer,
          offset: offset + localOffset + repeaterOffset + depthOffset,
        });

        children.push(child);
      });

      fields[fieldName] = ({
        description: fieldDescription,
        name: fieldName,
        view: fieldView,
        children,
      } as unknown) as FieldNameToField<FDesc>[typeof fieldName];

      return;
    }

    const value = getFieldValueFromNode(
      fieldNode,
      fieldDescription,
      serializer
    );

    const errors = validateValue(fieldDescription.validators, fieldName, value);

    fields[fieldName] = ({
      description: fieldDescription,
      name: fieldName,
      view: fieldView,
      value,
      errors,
      // We coerce types here: it's difficult to prove we've the right shape here
      // to the compiler, and we're already beholden to runtime behaviour as there's
      // no guarantee that the node's `name` matches our spec. The errors above should
      // help to defend when something's wrong.
      update: (value: unknown) =>
        (fieldView.update as (value: unknown) => void)(value),
    } as unknown) as FieldNameToField<FDesc>[typeof fieldName];
  });

  return fields;
};

type UpdateFieldsFromNodeOptions<FDesc extends FieldDescriptions<string>> = {
  node: Node;
  fields: FieldNameToField<FDesc>;
  serializer: DOMSerializer;
  getPos: () => number;
  view: EditorView;
  innerDecos: DecorationSource;
  offset?: number;
};

/**
 * Calculate new field values and errors for an element from a Node representing
 * a set of fields in Prosemirror, returning a new Fields object containing the
 * new values.
 *
 * Does not update the FieldViews associated with each field. This is best done
 * in a separate pass for optimisation and hygiene reasons, as it keeps this
 * function pure.
 */
export const updateFieldsFromNode = <FDesc extends FieldDescriptions<string>>({
  node,
  fields,
  getPos,
  serializer,
  view,
  innerDecos,
  offset = 0,
}: UpdateFieldsFromNodeOptions<FDesc>): FieldNameToField<FDesc> => {
  let newFields = fields;

  node.forEach((fieldNode, localOffset) => {
    const fieldName = getFieldNameFromNode(
      fieldNode
    ) as keyof FieldNameToField<FDesc>;
    const field = fields[fieldName];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this is possible at runtime.
    if (!field) {
      throw new Error(
        getErrorMessageForAbsentField(fieldName, Object.keys(fields))
      );
    }

    if (isRepeaterField(field)) {
      fieldNode.forEach((childNode, repeaterOffset, index) => {
        const accumulatedOffset = offset + localOffset + repeaterOffset;

        // The index of the child node may now differ from its field. We look the
        // field up via the fieldIndex, but write it to the nodeIndex, ensuring the
        // order of the child fields reflect the new node order.
        const pathToNewFieldIndex = `${fieldName}.children[${index}]`;
        const currentFieldIndex = field.children.findIndex(
          (childFields) =>
            childFields[RepeaterFieldMapIDKey] ===
            childNode.attrs[RepeaterFieldMapIDKey]
        );

        // Update the field in-place. If there is no field at this index, create one.
        const fields =
          currentFieldIndex !== -1
            ? field.children[currentFieldIndex]
            : getFieldsFromNode({
                node: childNode,
                fieldDescriptions: field.description.fields,
                view,
                getPos,
                serializer,
                offset: accumulatedOffset,
                innerDecos,
              });

        const newFieldsForChild = updateFieldsFromNode({
          node: childNode,
          fields,
          serializer,
          view,
          getPos,
          offset: accumulatedOffset,
          innerDecos,
        });

        if (
          newFieldsForChild !== field.children[index] ||
          index !== currentFieldIndex
        ) {
          newFields = set(pathToNewFieldIndex)(newFieldsForChild)(newFields);
        }
      });

      const amendedRepeaterField = newFields[fieldName] as RepeaterField<
        Record<string, never>
      >;

      // Remove any children that are no longer represented in the parent node.
      // Any old children that have not been replaced will be at the end of the
      // array of children, so truncating that array to the length of the node
      // will remove them.
      if (amendedRepeaterField.children.length > fieldNode.childCount) {
        const truncatedFieldChildren = amendedRepeaterField.children.slice(
          0,
          fieldNode.childCount
        );

        newFields = set(`${fieldName}.children`)(truncatedFieldChildren)(
          newFields
        );
      }

      return;
    }

    const newValue = getFieldValueFromNode(
      fieldNode,
      field.description,
      serializer
    );

    if (newValue === (field as Field<unknown>).value) {
      return;
    }

    newFields = set(`${fieldName}.value`)(newValue)(newFields);

    const newErrors = validateValue(
      field.description.validators,
      fieldName,
      newValue
    );

    newFields = set(`${fieldName}.errors`)(newErrors)(newFields);
  });

  return newFields;
};

/**
 * Given a node and a set of fields associated with that node, update the
 * corresponding FieldView instances in place.
 */
export const updateFieldViewsFromNode = <
  FDesc extends FieldDescriptions<string>
>(
  fields: FieldNameToField<FDesc>,
  node: Node,
  decos: DecorationSource,
  offset = 0
) => {
  node.forEach((node, localOffset) => {
    const fieldName = getFieldNameFromNode(
      node
    ) as keyof FieldNameToField<FDesc>;
    const field = fields[fieldName];
    field.view.onUpdate(node, offset + localOffset, decos);

    if (!isRepeaterField(field)) {
      return;
    }

    // We offset by two positions here to account for the additional depth
    // of the parent and child repeater nodes.
    const depthOffset = 2;
    node.forEach((childNode, repeaterOffset, index) => {
      updateFieldViewsFromNode(
        field.children[index],
        childNode,
        decos,
        offset + localOffset + repeaterOffset + depthOffset
      );
    });
  });
};

const getErrorMessageForAbsentField = (
  absentFieldName: string,
  possibleFieldNames: string[]
) =>
  `[prosemirror-elements]: Attempted to get values for a node with type ${absentFieldName} from fields ${Object.keys(
    possibleFieldNames
  ).join("")}, but field was not present.`;

const applyFieldUUIDToObject = (obj: Record<string, unknown>, uuid: string) =>
  (obj[RepeaterFieldMapIDKey] = uuid);
