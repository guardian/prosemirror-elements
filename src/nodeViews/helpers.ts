import type { FieldSpec } from "../types/Embed";
import type { CheckboxFields, CheckboxNodeView } from "./CheckboxNodeView";
import type { RTENodeView } from "./RTENodeView";

/**
 * A map from all NodeView types to the values they create at runtime.
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
