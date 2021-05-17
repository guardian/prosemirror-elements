import type { NodeViewPropValues } from "../nodeViews/helpers";
import type { EmbedProps, NodeViewPropMap } from "./Embed";
import type { TErrors } from "./Errors";

export type TConsumer<ConsumerResult, Props extends EmbedProps<string>> = (
  fields: NodeViewPropValues<Props>,
  errors: TErrors,
  updateFields: (fields: NodeViewPropValues<Props>) => void,
  nestedEditors: NodeViewPropMap<Props>
) => ConsumerResult;
