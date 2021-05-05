import type { Schema } from "prosemirror-model";
import type { RTENodeView } from "../nodeViews/RTENode";
import type { TCommandCreator } from "./Commands";
import type { TFields } from "./Fields";

export type NestedEditorMap<LocalSchema extends Schema = Schema> = Record<
  string,
  RTENodeView<LocalSchema>
>;

export type TEmbed<FieldAttrs extends TFields> = (
  dom: HTMLElement,
  nestedEditors: NestedEditorMap,
  updateState: (fields: Partial<FieldAttrs>, hasErrors: boolean) => void,
  initFields: FieldAttrs,
  commands: ReturnType<TCommandCreator>
) => (fields: FieldAttrs, commands: ReturnType<TCommandCreator>) => void;
