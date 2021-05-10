import type { Schema } from "prosemirror-model";
import type { RTENodeView } from "../nodeViews/RTENode";
import type { TCommandCreator } from "./Commands";
import type { TFields } from "./Fields";

export type NestedEditorMap<LocalSchema extends Schema = Schema> = Record<
  string,
  RTENodeView<LocalSchema>
>;

export type ElementProps = Readonly<{
  type: "string";
  name: string;
}>;

export type SchemaFromProps<Props extends Readonly<ElementProps[]>> = Schema<
  Props[number]["name"]
>;

export type NestedEditorMapFromProps<Props extends Readonly<ElementProps[]>> = {
  [name in Props[number]["name"]]: RTENodeView<SchemaFromProps<Props>>;
};

export type TEmbed<Props extends Readonly<ElementProps[]>> = (
  dom: HTMLElement,
  nestedEditors: NestedEditorMapFromProps<Props>,
  updateState: (fields: TFields, hasErrors: boolean) => void,
  initFields: TFields,
  commands: ReturnType<TCommandCreator>
) => (fields: TFields, commands: ReturnType<TCommandCreator>) => void;
