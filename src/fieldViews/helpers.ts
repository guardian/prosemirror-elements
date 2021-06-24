import type OrderedMap from "orderedmap";
import type { NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { getNodeSpecForProp } from "../nodeSpec";
import type { CustomField, Field, FieldSpec } from "../types/Element";
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

export const addRootNodeToSchema = (schema: Schema, propName: string) =>
  new Schema({
    nodes: schema.spec.nodes,
    marks: schema.spec.marks,
    topNode: propName,
  });
