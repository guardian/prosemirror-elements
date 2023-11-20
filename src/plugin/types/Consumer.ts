import type { FieldNameToValueMap } from "../helpers/fieldView";
import type { FieldDescriptions, FieldNameToField } from "./Element";

export type ConsumerOptions<FDesc extends FieldDescriptions<string>> = {
  fields: FieldNameToField<FDesc>;
  updateFields: (fieldValues: FieldNameToValueMap<FDesc>) => void;
  useAlternateStyles?: boolean
};

export type Consumer<
  ConsumerResult,
  FDesc extends FieldDescriptions<string>
> = (options: ConsumerOptions<FDesc>) => ConsumerResult;
