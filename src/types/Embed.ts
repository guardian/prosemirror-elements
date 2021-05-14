import type { NodeSpec, Schema } from "prosemirror-model";
import type { RTENodeView } from "../nodeViews/RTENode";
import type { TCommandCreator } from "./Commands";
import type { TFields } from "./Fields";

export type NestedEditorMap<LocalSchema extends Schema = Schema> = Record<
  string,
  RTENodeView<LocalSchema>
>;

/**
 * A property of an embed, to be modelled as a Node in Prosemirror.
 */
interface Prop {
  // The data type of the property.
  type: string;
  // The name the property should have in the schema. Should be unique within the schema.
  name: string;
}

interface RTEProp
  extends Prop,
    Partial<Pick<NodeSpec, "toDOM" | "parseDOM" | "content">> {
  type: "richText";
  name: string;
}

export type ElementProp = RTEProp;

export type ElementProps = Readonly<ElementProp[]>;

export type SchemaFromProps<Props extends ElementProps> = Schema<
  Props[number]["name"]
>;

export type NodeViewProp = {
  nodeView: RTENodeView<Schema>;
  prop: ElementProp;
};

export type NestedEditorMapFromProps<Props extends ElementProps> = {
  [name in Props[number]["name"]]: NodeViewProp;
};

export type TEmbed<Props extends ElementProps, Name extends string> = {
  name: Name;
  props: Props;
  nodeSpec: NodeSpec;
  createEmbed: (
    dom: HTMLElement,
    nestedEditors: NestedEditorMapFromProps<Props>,
    updateState: (fields: TFields, hasErrors: boolean) => void,
    initFields: TFields,
    commands: ReturnType<TCommandCreator>
  ) => (fields: TFields, commands: ReturnType<TCommandCreator>) => void;
};
