import type { NodeSpec, Schema } from "prosemirror-model";
import type { EmbedNodeView } from "../nodeViews/EmbedNodeView";
import type { TCommandCreator } from "./Commands";
import type { TFields } from "./Fields";

/**
 * The specification for an embed property, to be modelled as a Node in Prosemirror.
 */
interface BasePropSpec {
  // The data type of the property.
  type: string;
}

interface CheckboxProp extends BasePropSpec {
  type: "checkbox";
  defaultValue: boolean;
}

interface RTEProp
  extends BasePropSpec,
    Partial<Pick<NodeSpec, "toDOM" | "parseDOM" | "content">> {
  type: "richText";
}

export type PropSpec = RTEProp | CheckboxProp;

export type EmbedProps<Names extends string> = Record<Names, PropSpec>;

export type SchemaFromProps<Props extends EmbedProps<string>> = Schema<
  Extract<keyof Props, string>
>;

export type NodeViewProp = {
  nodeView: EmbedNodeView;
  prop: PropSpec;
  name: string;
};

export type NodeViewPropMapFromProps<Props extends EmbedProps<string>> = {
  [name in Extract<keyof Props, string>]: NodeViewProp;
};

export type TEmbed<Props extends EmbedProps<string>, Name extends string> = {
  name: Name;
  props: Props;
  nodeSpec: NodeSpec;
  createUpdator: (
    dom: HTMLElement,
    nestedEditors: NodeViewPropMapFromProps<Props>,
    updateState: (fields: TFields, hasErrors: boolean) => void,
    initFields: TFields,
    commands: ReturnType<TCommandCreator>
  ) => (fields: TFields, commands: ReturnType<TCommandCreator>) => void;
};
