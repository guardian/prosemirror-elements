import type { TFields } from "./Fields";

export type TValidator = (fields: TFields) => null | Record<string, string[]>;
