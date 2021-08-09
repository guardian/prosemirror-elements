import type { FieldSpec } from "../types/Element";
import { CheckboxFieldView } from "./CheckboxFieldView";
import type { CheckboxValue } from "./CheckboxFieldView";
import type { CustomField } from "./CustomFieldView";
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
  [CustomFieldView.fieldName]: Field extends CustomField<infer Data>
    ? CustomFieldView<Data>
    : never;
};

/**
 * A map from all FieldView types to the serialised values they create at runtime.
 */
export type FieldTypeToValueMap<
  FSpec extends FieldSpec<string>,
  Name extends keyof FSpec
> = {
  [TextFieldView.fieldName]: string;
  [RichTextFieldView.fieldName]: string;
  [CheckboxFieldView.fieldName]: CheckboxValue;
  [DropdownFieldView.fieldName]: string;
  [CustomFieldView.fieldName]: FSpec[Name] extends CustomField<infer Data>
    ? Data
    : never;
};

/**
 * Get the values that would be provided by the given FieldSpec at runtime,
 * keyed by their names. For example, for the FieldSpec:
 *
 * `{ altText: { type: "richText" }, isVisible: { type: "checkbox" }}`
 *
 * The resulting type would be:
 *
 * `{ altText: string }, { isVisible: { value: boolean }}`
 */
export type FieldNameToValueMap<FSpec extends FieldSpec<keyof FSpec>> = {
  [Name in keyof FSpec]: FieldTypeToValueMap<FSpec, Name>[FSpec[Name]["type"]];
};
