import type { Node, Schema } from "prosemirror-model";
import { DOMParser, DOMSerializer, Slice } from "prosemirror-model";
import type { Step } from "prosemirror-transform";
import { ReplaceAroundStep, ReplaceStep } from "prosemirror-transform";
import type { CustomField, FieldSpec } from "../types/Element";
import { CheckboxFieldView } from "./CheckboxFieldView";
import type { CheckboxFields } from "./CheckboxFieldView";
import { CustomFieldView } from "./CustomFieldView";
import type { DropdownFields } from "./DropdownFieldView";
import { DropdownFieldView } from "./DropdownFieldView";
import { RichTextFieldView } from "./RichTextFieldView";
import { TextFieldView } from "./TextFieldView";

export const fieldTypeToViewMap = {
  [TextFieldView.propName]: TextFieldView,
  [RichTextFieldView.propName]: RichTextFieldView,
  [CheckboxFieldView.propName]: CheckboxFieldView,
  [DropdownFieldView.propName]: DropdownFieldView,
  [CustomFieldView.propName]: CustomFieldView,
};

export type FieldTypeToViewMap<Field> = {
  [TextFieldView.propName]: TextFieldView;
  [RichTextFieldView.propName]: RichTextFieldView;
  [CheckboxFieldView.propName]: CheckboxFieldView;
  [DropdownFieldView.propName]: DropdownFieldView;
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
  [TextFieldView.propName]: string;
  [RichTextFieldView.propName]: string;
  [CheckboxFieldView.propName]: CheckboxFields;
  [DropdownFieldView.propName]: DropdownFields;
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
