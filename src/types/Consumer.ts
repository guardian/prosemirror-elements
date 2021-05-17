import type { NodeViewPropValues } from "../nodeViews/helpers";
import type { EmbedProps, NodeViewPropMap } from "./Embed";
import type { TErrors } from "./Errors";
import type { TFields } from "./Fields";

export type TConsumer<ConsumerResult, Props extends EmbedProps<string>> = (
  fields: NodeViewPropValues<Props>,
  errors: TErrors,
  updateFields: (fields: TFields) => void,
  nestedEditors: NodeViewPropMap<Props>
) => ConsumerResult;
