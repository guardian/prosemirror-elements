import type { FieldNameToValueMap } from "../nodeViews/helpers";
import type { FieldNameToNodeViewSpec, FieldSpec } from "./Embed";
import type { TErrors } from "./Errors";

export type Consumer<ConsumerResult, FSpec extends FieldSpec<string>> = (
  fieldValues: FieldNameToValueMap<FSpec>,
  errors: TErrors,
  updateFields: (fieldValues: FieldNameToValueMap<FSpec>) => void,
  fields: FieldNameToNodeViewSpec<FSpec>
) => ConsumerResult;
