import { set } from "lodash/fp";
import type { DOMSerializer, Node } from "prosemirror-model";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { getFieldValueFromNode } from "./helpers/element";
import { getElementFieldViewFromType } from "./helpers/fieldView";
import { validateValue } from "./helpers/validation";
import { getFieldNameFromNode } from "./nodeSpec";
import type {
  Field,
  FieldDescriptions,
  FieldNameToField,
} from "./types/Element";
import { isRepeaterField } from "./types/Element";

type GetFieldsFromNodeOptions<FDesc extends FieldDescriptions<string>> = {
  node: Node;
  fieldDescriptions: FDesc;
  view: EditorView;
  getPos: () => number;
  innerDecos: Array<Decoration<Record<string, unknown>>> | DecorationSet;
  serializer: DOMSerializer;
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
}: GetFieldsFromNodeOptions<FDesc>): FieldNameToField<FDesc> => {
  const fields = {} as FieldNameToField<FDesc>;

  node.forEach((fieldNode, offset) => {
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

    const fieldView = getElementFieldViewFromType(fieldDescription, {
      node: fieldNode,
      view,
      getPos,
      offset,
      innerDecos,
    });

    if (fieldDescription.type === "repeater") {
      const children = [] as unknown[];
      fieldNode.forEach((repeaterChildNode, localOffset) => {
        // We offset by two positions here to account for the additional depth
        // of the parent and child repeater nodes.
        const depthOffset = 2;
        const localGetPos = () => getPos() + offset + localOffset + depthOffset;
        children.push(
          getFieldsFromNode({
            node: repeaterChildNode,
            fieldDescriptions: fieldDescription.fields,
            view,
            getPos: localGetPos,
            innerDecos,
            serializer,
          })
        );
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
};

/**
 * Calculate new field values and errors for an element from a Node representing
 * a set of fields in Prosemirror, returning a new Fields object containing the
 * new values.
 */
export const updateFieldsFromNode = <FDesc extends FieldDescriptions<string>>({
  node,
  fields,
  serializer,
}: UpdateFieldsFromNodeOptions<FDesc>): FieldNameToField<FDesc> => {
  let newFields = fields;

  node.forEach((fieldNode) => {
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
      fieldNode.forEach((childNode, _, index) => {
        const pathToChild = `${fieldName}.children[${index}]`;
        const newFieldsForChild = updateFieldsFromNode({
          node: childNode,
          fields: field.children[index],
          serializer,
        });

        if (newFieldsForChild !== field.children[index]) {
          newFields = set(pathToChild)(newFieldsForChild)(newFields);
        }
      });

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

const getErrorMessageForAbsentField = (
  absentFieldName: string,
  possibleFieldNames: string[]
) =>
  `[prosemirror-elements]: Attempted to get values for a node with type ${absentFieldName} from fields ${Object.keys(
    possibleFieldNames
  ).join("")}, but field was not present.`;
