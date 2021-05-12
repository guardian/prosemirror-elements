import type { ElementProps, NestedEditorMapFromProps } from "./Embed";
import type { TErrors } from "./Errors";
import type { TFields } from "./Fields";

export type TConsumer<ConsumerResult, Props extends ElementProps> = (
  fields: TFields,
  errors: TErrors,
  updateFields: (fields: TFields) => void,
  nestedEditors: NestedEditorMapFromProps<Props>
) => ConsumerResult;
