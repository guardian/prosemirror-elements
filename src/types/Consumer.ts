import type { FieldNameToValueMap } from "../nodeViews/helpers";
import type { FieldNameToNodeViewSpec, FieldSpec } from "./Element";
import type { Errors } from "./Errors";

export type Consumer<ConsumerResult, FSpec extends FieldSpec<string>> = (
  fieldValues: FieldNameToValueMap<FSpec>,
  errors: Errors,
  updateFields: (fieldValues: FieldNameToValueMap<FSpec>) => void,
  fields: FieldNameToNodeViewSpec<FSpec>
) => ConsumerResult;
