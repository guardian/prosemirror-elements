import type { FieldNameToValueMap } from "../fieldViews/helpers";
import type { FieldDescriptions, FieldNameToField } from "./Element";
import type { Errors } from "./Errors";

export type Consumer<
  ConsumerResult,
  FDesc extends FieldDescriptions<string>
> = (
  fieldValues: FieldNameToValueMap<FDesc>,
  errors: Errors,
  updateFields: (fieldValues: FieldNameToValueMap<FDesc>) => void,
  fields: FieldNameToField<FDesc>
) => ConsumerResult;
