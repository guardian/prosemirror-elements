import type { NestedEditorMap } from "./Embed";
import type { TErrors } from "./Errors";
import type { TFields } from "./Fields";

export type TConsumer<ConsumerResult> = (
  fields: TFields,
  errors: TErrors,
  updateFields: (fields: TFields) => void,
  nestedEditors: NestedEditorMap
) => ConsumerResult;
