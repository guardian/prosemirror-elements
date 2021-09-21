import type { KeysWithValsOfType, Optional } from "../helpers/types";
import type { FieldDescriptions } from "../types/Element";
import { CheckboxFieldView } from "./CheckboxFieldView";
import type { CheckboxValue } from "./CheckboxFieldView";
import type { CustomFieldDescription } from "./CustomFieldView";
import { CustomFieldView } from "./CustomFieldView";
import { DropdownFieldView } from "./DropdownFieldView";
import { RichTextFieldView } from "./RichTextFieldView";
import { TextFieldView } from "./TextFieldView";

export const fieldTypeToViewMap = {
  [TextFieldView.fieldName]: TextFieldView,
  [RichTextFieldView.fieldName]: RichTextFieldView,
  [CheckboxFieldView.fieldName]: CheckboxFieldView,
  [DropdownFieldView.fieldName]: DropdownFieldView,
  [CustomFieldView.fieldName]: CustomFieldView,
};

export type FieldTypeToViewMap<Field> = {
  [TextFieldView.fieldName]: TextFieldView;
  [RichTextFieldView.fieldName]: RichTextFieldView;
  [CheckboxFieldView.fieldName]: CheckboxFieldView;
  [DropdownFieldView.fieldName]: DropdownFieldView;
  [CustomFieldView.fieldName]: Field extends CustomFieldDescription<infer Data>
    ? CustomFieldView<Data>
    : never;
};

/**
 * A map from all FieldView types to the serialised values they create at runtime.
 */
export type FieldTypeToValueMap<
  FDesc extends FieldDescriptions<string>,
  Name extends keyof FDesc
> = {
  [TextFieldView.fieldName]: string;
  [RichTextFieldView.fieldName]: string;
  [CheckboxFieldView.fieldName]: CheckboxValue;
  [DropdownFieldView.fieldName]: string;
  [CustomFieldView.fieldName]: FDesc[Name] extends CustomFieldDescription<
    infer Data
  >
    ? Data
    : never;
};

/**
 * Get the values that would be provided by the given FieldDescriptions at runtime,
 * keyed by their names. For example, for the FieldDescriptions:
 *
 * `{ altText: { type: "richText" }, isVisible: { type: "checkbox" }}`
 *
 * The resulting type would be:
 *
 * `{ altText: string }, { isVisible: { value: boolean }}`
 */
export type FieldNameToValueMap<
  FDesc extends FieldDescriptions<keyof FDesc>
> = {
  [Name in keyof FDesc]: FieldTypeToValueMap<FDesc, Name>[FDesc[Name]["type"]];
};

/**
 * As with `FieldNameToValueMap`, but respects the `absentOnEmpty` value
 * to produce a result that reflects the output type of `getElementDataFromNode`.
 */
export type FieldNameToValueMapWithEmptyValues<
  FDesc extends FieldDescriptions<keyof FDesc>
> = Optional<
  FieldNameToValueMap<FDesc>,
  KeysWithValsOfType<FDesc, { absentOnEmpty: true }>
>;
