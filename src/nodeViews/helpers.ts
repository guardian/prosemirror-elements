import type { EmbedProps } from "../types/Embed";
import type { CheckboxFields, CheckboxNodeView } from "./CheckboxNodeView";
import type { RTENodeView } from "./RTENodeView";

/**
 * A map from all NodeView types to the values they create at runtime.
 */
export type NodeViewValueMap = {
  [CheckboxNodeView.propName]: CheckboxFields;
  [RTENodeView.propName]: string;
};

/**
 * Get the values that would be provided by the given PropSpecs at runtime,
 * keyed by their names. For example, for the props:
 *
 * `{ altText: { type: "richText" }, isVisible: { type: "checkbox" }}`
 *
 * The resulting type would be:
 *
 * `{ altText: string }, { isVisible: { value: boolean }}`
 */
export type NodeViewPropValues<Props extends EmbedProps<string>> = {
  [Name in keyof Props]: NodeViewValueMap[Props[Name]["type"]];
};
