import type { NodeSpec, Schema } from "prosemirror-model";
import type { RTENodeView } from "../nodeViews/RTENode";
import type { TCommandCreator } from "./Commands";
import type { TFields } from "./Fields";

export type NestedEditorMap<LocalSchema extends Schema = Schema> = Record<
  string,
  RTENodeView<LocalSchema>
>;

type RTEProp = Readonly<
  {
    type: "richText";
    name: string;
  } & Partial<Pick<NodeSpec, "toDOM" | "parseDOM" | "content">>
>;

export type ElementProp = RTEProp;

export type ElementProps = Readonly<ElementProp[]>;

export type SchemaFromProps<Props extends ElementProps> = Schema<
  Props[number]["name"]
>;

export type NestedEditorMapFromProps<Props extends ElementProps> = {
  [name in Props[number]["name"]]: RTENodeView<SchemaFromProps<Props>>;
};

export type TEmbed<Props extends ElementProps> = {
  nodeSpec: NodeSpec;
  createEmbed: (
    dom: HTMLElement,
    nestedEditors: NestedEditorMapFromProps<Props>,
    updateState: (fields: TFields, hasErrors: boolean) => void,
    initFields: TFields,
    commands: ReturnType<TCommandCreator>
  ) => (fields: TFields, commands: ReturnType<TCommandCreator>) => void;
};
