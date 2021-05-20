import type { FieldSpec } from "../types/Embed";
import { CheckboxNodeView } from "./CheckboxNodeView";
import type { CheckboxFields } from "./CheckboxNodeView";
import { RTENodeView } from "./RTENodeView";

export const fieldTypeToViewMap = {
  [RTENodeView.propName]: RTENodeView,
  [CheckboxNodeView.propName]: CheckboxNodeView,
};

/**
 * A map from all NodeView types to the serialised values they create at runtime.
 */
export type FieldTypeToValueMap = {
  [CheckboxNodeView.propName]: CheckboxFields;
  [RTENodeView.propName]: string;
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
  [Name in keyof FSpec]: FieldTypeToValueMap[FSpec[Name]["type"]];
};
