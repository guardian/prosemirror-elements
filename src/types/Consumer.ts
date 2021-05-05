import type { NestedEditorMap } from "./Embed";
import type { TErrors } from "./Errors";
import type { TFields } from "./Fields";

export type TConsumer<ConsumerResult, FieldAttrs extends TFields> = (
  fields: FieldAttrs,
  errors: TErrors,
  updateFields: (fields: Partial<FieldAttrs>) => void,
  nestedEditors: NestedEditorMap
) => ConsumerResult;
