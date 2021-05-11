import type { TFields } from "./Fields";

export type TValidator<FieldAttrs extends TFields> = (
  fields: FieldAttrs
) => null | Record<string, string[]>;
