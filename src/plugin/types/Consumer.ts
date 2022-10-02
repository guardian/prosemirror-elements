import type { FieldValidationErrors } from "../elementSpec";
import type { FieldNameToValueMap } from "../helpers/fieldView";
import type { FieldDescriptions, FieldNameToField } from "./Element";

export type ConsumerOptions<FDesc extends FieldDescriptions> = {
  fields: FieldNameToField<FDesc>;
  errors: FieldValidationErrors;
  fieldValues: FieldNameToValueMap<FDesc>;
  updateFields: (fieldValues: FieldNameToValueMap<FDesc>) => void;
};

export type Consumer<ConsumerResult, FDesc extends FieldDescriptions> = (
  options: ConsumerOptions<FDesc>
) => ConsumerResult;
