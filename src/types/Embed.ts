import type { NodeSpec, Schema } from "prosemirror-model";
import type { CheckboxNodeView } from "../nodeViews/CheckboxNodeView";
import type { NodeViewPropValues } from "../nodeViews/helpers";
import type { RTENodeView } from "../nodeViews/RTENodeView";
import type { TCommandCreator } from "./Commands";

/**
 * The specification for an embed property, to be modelled as a Node in Prosemirror.
 */
interface BasePropSpec {
  // The data type of the property.
  type: string;
}

interface CheckboxProp extends BasePropSpec {
  type: typeof CheckboxNodeView.propName;
  defaultValue: boolean;
}

interface RTEProp
  extends BasePropSpec,
    Partial<Pick<NodeSpec, "toDOM" | "parseDOM" | "content">> {
  type: typeof RTENodeView.propName;
}

export type PropSpec = RTEProp | CheckboxProp;

export type EmbedProps<Names extends string> = Record<Names, PropSpec>;

export type SchemaFromProps<Props extends EmbedProps<string>> = Schema<
  Extract<keyof Props, string>
>;

export type EmbedNodeViews = RTENodeView | CheckboxNodeView;

export type NodeViewProp = {
  nodeView: EmbedNodeViews;
  prop: PropSpec;
  name: string;
};

export type NodeViewPropMap<Props extends EmbedProps<string>> = {
  [name in Extract<keyof Props, string>]: NodeViewProp;
};

export type TEmbed<Props extends EmbedProps<string>, Name extends string> = {
  name: Name;
  props: Props;
  nodeSpec: NodeSpec;
  createUpdator: (
    dom: HTMLElement,
    nestedEditors: NodeViewPropMap<Props>,
    updateState: (
      fields: NodeViewPropValues<Props>,
      hasErrors: boolean
    ) => void,
    initFields: NodeViewPropValues<Props>,
    commands: ReturnType<TCommandCreator>
  ) => (
    fields: NodeViewPropValues<Props>,
    commands: ReturnType<TCommandCreator>
  ) => void;
};
