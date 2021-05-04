import type { TErrors } from "./Errors";
import type { TFields } from "./Fields";

export type TConsumer<ConsumerResult, FieldAttrs extends TFields> = (
  fields: FieldAttrs,
  errors: TErrors,
  updateFields: (fields: FieldAttrs) => void
) => ConsumerResult;
