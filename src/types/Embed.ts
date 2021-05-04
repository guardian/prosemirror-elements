// @todo: placeholder

import type { TCommandCreator } from "./Commands";
import type { TFields } from "./Fields";

export type TEmbed<FieldAttrs extends TFields> = (
  dom: HTMLElement,
  updateState: (fields: TFields, hasErrors: boolean) => void,
  initFields: FieldAttrs,
  commands: ReturnType<TCommandCreator>
) => (fields: FieldAttrs, commands: ReturnType<TCommandCreator>) => void;
