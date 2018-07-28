import TFields from "./Fields";
import TErrors from "./Errors";
import { TCommands } from "./Commands";

type TFieldErrors = {
  [key: string]: string[]
};

type TConsumer<ConsumerResult, FieldAttrs extends TFields> = (
  fields: FieldAttrs,
  errors: TFieldErrors,
  commands: TCommands,
  updateFields: (fields: FieldAttrs) => void
) => ConsumerResult;

export default TConsumer;
