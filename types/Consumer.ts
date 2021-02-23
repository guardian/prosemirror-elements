import TFields from "./Fields";
import TErrors from "./Errors";

type TConsumer<ConsumerResult, FieldAttrs extends TFields> = (
  fields: FieldAttrs,
  errors: TErrors,
  updateFields: (fields: FieldAttrs) => void,
  contentDOM: HTMLElement
) => ConsumerResult;

export default TConsumer;
