import type { TFields } from "./Fields";

export type TValidator<FieldAttrs extends TFields> = (
  fields: Partial<FieldAttrs>
) => null | Record<string, string[]>;
