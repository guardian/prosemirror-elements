import type { EmbedProps, NodeViewPropMapFromProps } from "./Embed";
import type { TErrors } from "./Errors";
import type { TFields } from "./Fields";

export type TConsumer<ConsumerResult, Props extends EmbedProps<string>> = (
  fields: TFields,
  errors: TErrors,
  updateFields: (fields: TFields) => void,
  nestedEditors: NodeViewPropMapFromProps<Props>
) => ConsumerResult;
