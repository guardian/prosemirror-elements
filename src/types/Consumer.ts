import type { FieldNameToValueMap } from "../nodeViews/helpers";
import type { FieldNameToNodeViewSpec, FieldSpec } from "./Embed";
import type { TErrors } from "./Errors";

export type TConsumer<ConsumerResult, FSpec extends FieldSpec<string>> = (
  fields: FieldNameToValueMap<FSpec>,
  errors: TErrors,
  updateFields: (fields: FieldNameToValueMap<FSpec>) => void,
  fields: FieldNameToNodeViewSpec<FSpec>
) => ConsumerResult;
