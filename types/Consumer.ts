import TFields from "./Fields";
import TErrors from "./Errors";
import { NestedEditorMap } from "./Embed";

type TConsumer<ConsumerResult, FieldAttrs extends TFields> = (
  fields: FieldAttrs,
  errors: TErrors,
  updateFields: (fields: FieldAttrs) => void,
  nestedEditors: NestedEditorMap
) => ConsumerResult;

export default TConsumer;
