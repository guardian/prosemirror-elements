import type { CustomField, FieldSpec } from "../types/Element";
import { CheckboxNodeView } from "./CheckboxNodeView";
import type { CheckboxFields } from "./CheckboxNodeView";
import { CustomNodeView } from "./CustomNodeView";
import { RTENodeView } from "./RTENodeView";

export const fieldTypeToViewMap = {
  [RTENodeView.propName]: RTENodeView,
  [CheckboxNodeView.propName]: CheckboxNodeView,
  [CustomNodeView.propName]: CustomNodeView,
};

export type FieldTypeToViewMap<Field> = {
  [RTENodeView.propName]: RTENodeView;
  [CheckboxNodeView.propName]: CheckboxNodeView;
  [CustomNodeView.propName]: Field extends CustomField<infer Data>
    ? CustomNodeView<Data>
    : never;
};

/**
 * A map from all NodeView types to the serialised values they create at runtime.
 */
export type FieldTypeToValueMap<
  FSpec extends FieldSpec<string>,
  Name extends keyof FSpec
> = {
  [CheckboxNodeView.propName]: CheckboxFields;
  [RTENodeView.propName]: string;
  [CustomNodeView.propName]: FSpec[Name] extends CustomField<infer Data>
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
