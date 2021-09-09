import type { FieldValidationErrors } from "../elementSpec";
import type { FieldNameToValueMap } from "../fieldViews/helpers";
import type { FieldDescriptions, FieldNameToField } from "./Element";

export type Consumer<
  ConsumerResult,
  FDesc extends FieldDescriptions<string>
> = (
  fieldValues: FieldNameToValueMap<FDesc>,
  errors: FieldValidationErrors,
  updateFields: (fieldValues: FieldNameToValueMap<FDesc>) => void,
  fields: FieldNameToField<FDesc>
) => ConsumerResult;
