import type { Schema } from "prosemirror-model";
import type { RTENodeView } from "../nodeViews/RTENode";
import type { TCommandCreator } from "./Commands";
import type { TFields } from "./Fields";

export type NestedEditorMap<LocalSchema extends Schema = Schema> = Record<
  string,
  RTENodeView<LocalSchema>
>;

export type TEmbed = (
  dom: HTMLElement,
  nestedEditors: NestedEditorMap,
  updateState: (fields: TFields, hasErrors: boolean) => void,
  initFields: TFields,
  commands: ReturnType<TCommandCreator>
) => (fields: TFields, commands: ReturnType<TCommandCreator>) => void;
