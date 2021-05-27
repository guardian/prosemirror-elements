import type { FieldSpec } from "../types/Element";
import { CheckboxNodeView } from "./CheckboxNodeView";
import type { CheckboxFields } from "./CheckboxNodeView";
import type { ImageFields } from "./ImageNodeView";
import { ImageNodeView } from "./ImageNodeView";
import { RTENodeView } from "./RTENodeView";

export const fieldTypeToViewMap = {
  [RTENodeView.propName]: RTENodeView,
  [CheckboxNodeView.propName]: CheckboxNodeView,
  [ImageNodeView.propName]: ImageNodeView,
};

export type FieldTypeToViewMap = {
  [RTENodeView.propName]: RTENodeView;
  [CheckboxNodeView.propName]: CheckboxNodeView;
  [ImageNodeView.propName]: ImageNodeView;
};

/**
 * A map from all NodeView types to the serialised values they create at runtime.
 */
export type FieldTypeToValueMap = {
  [CheckboxNodeView.propName]: CheckboxFields;
  [RTENodeView.propName]: string;
  [ImageNodeView.propName]: ImageFields;
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
