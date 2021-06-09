import type { FieldNameToValueMap } from "../fieldViews/helpers";
import type { FieldNameToFieldViewSpec, FieldSpec } from "./Element";
import type { Errors } from "./Errors";

export type Consumer<ConsumerResult, FSpec extends FieldSpec<string>> = (
  fieldValues: FieldNameToValueMap<FSpec>,
  errors: Errors,
  updateFields: (fieldValues: FieldNameToValueMap<FSpec>) => void,
  fields: FieldNameToFieldViewSpec<FSpec>
) => ConsumerResult;
