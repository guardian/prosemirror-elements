import { set } from "lodash/fp";
import type { DOMSerializer, Node } from "prosemirror-model";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { getFieldValueFromNode } from "./helpers/element";
import { getElementFieldViewFromType } from "./helpers/fieldView";
import { validateValue } from "./helpers/validation";
import { getFieldNameFromNode } from "./nodeSpec";
import type {
  ElementSpec,
  FieldDescriptions,
  FieldNameToField,
} from "./types/Element";

type GetFieldsFromNodeOptions<FDesc extends FieldDescriptions<string>> = {
  elementNode: Node;
  element: ElementSpec<FDesc>;
  view: EditorView;
  getPos: () => number;
  innerDecos: Array<Decoration<Record<string, unknown>>> | DecorationSet;
  serializer: DOMSerializer;
};

/**
 * Get the fields for an element from a Node representing that element in Prosemirror.
 */
export const getFieldsFromElementNode = <
  FDesc extends FieldDescriptions<string>
>({
  elementNode,
  element,
  view,
  getPos,
  innerDecos,
  serializer,
}: GetFieldsFromNodeOptions<FDesc>): FieldNameToField<FDesc> => {
  const fields = {} as FieldNameToField<FDesc>;

  elementNode.forEach((fieldNode, offset) => {
    const fieldName = getFieldNameFromNode(
      fieldNode
    ) as keyof FieldNameToField<FDesc>;
    const fieldDescription = element.fieldDescriptions[fieldName];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- strictly, we should check.
    if (!fieldDescription) {
      throw new Error(
        `[prosemirror-elements]: Attempted to instantiate a nodeView with type ${fieldName}, but could not find the associated field`
      );
    }

    const fieldView = getElementFieldViewFromType(fieldDescription, {
      node: fieldNode,
      view,
      getPos,
      offset,
      innerDecos,
    });

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
        fieldView && (fieldView.update as (value: unknown) => void)(value),
    } as unknown) as FieldNameToField<FDesc>[typeof fieldName];
  });

  return fields;
};

type UpdateFieldsFromNodeOptions<FDesc extends FieldDescriptions<string>> = {
  elementNode: Node;
  fields: FieldNameToField<FDesc>;
  serializer: DOMSerializer;
};

/**
 * Calculate new field values and errors for an element from a Node representing
 * that element in Prosemirror, returning a new Fields object containing the new
 * values.
 */
export const updateFieldsAndErrorsFromNode = <
  FDesc extends FieldDescriptions<string>
>({
  elementNode,
  fields,
  serializer,
}: UpdateFieldsFromNodeOptions<FDesc>): FieldNameToField<FDesc> => {
  let newFields = fields;

  elementNode.forEach((fieldNode) => {
    const fieldName = getFieldNameFromNode(
      fieldNode
    ) as keyof FieldNameToField<FDesc>;

    const newValue = getFieldValueFromNode(
      fieldNode,
      fields[fieldName].description,
      serializer
    );

    newFields = set(`${fieldName}.value`)(newValue)(newFields);

    const newErrors = validateValue(
      fields[fieldName].description.validators,
      fieldName,
      newValue
    );

    newFields = set(`${fieldName}.errors`)(newErrors)(newFields);
  });

  return newFields;
};
