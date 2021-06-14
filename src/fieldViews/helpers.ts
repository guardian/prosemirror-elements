import type { CustomField, FieldSpec } from "../types/Element";
import { CheckboxFieldView } from "./CheckboxFieldView";
import type { CheckboxFields } from "./CheckboxFieldView";
import { CustomFieldView } from "./CustomFieldView";
import { RichTextFieldView } from "./RichTextFieldView";
import { TextFieldView } from "./TextFieldView";

export const fieldTypeToViewMap = {
  [TextFieldView.propName]: TextFieldView,
  [RichTextFieldView.propName]: RichTextFieldView,
  [CheckboxFieldView.propName]: CheckboxFieldView,
  [CustomFieldView.propName]: CustomFieldView,
};

export type FieldTypeToViewMap<Field> = {
  [TextFieldView.propName]: TextFieldView;
  [RichTextFieldView.propName]: RichTextFieldView;
  [CheckboxFieldView.propName]: CheckboxFieldView;
  [CustomFieldView.propName]: Field extends CustomField<infer Data>
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
  [CheckboxFieldView.propName]: CheckboxFields;
  [RichTextFieldView.propName]: string;
  [TextFieldView.propName]: string;
  [CustomFieldView.propName]: FSpec[Name] extends CustomField<infer Data>
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
export type FieldNameToValueMap<FSpec extends FieldSpec<string>> = {
  [Name in keyof FSpec]: FieldTypeToValueMap<FSpec, Name>[FSpec[Name]["type"]];
};
