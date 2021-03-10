import TFields from "./types/Fields";
import TEmbed from "./types/Embed";
import TConsumer from "./types/Consumer";
import TValidator from "./types/Validator";
import { TCommands, TCommandCreator } from "./types/Commands";

const createUpdater = () => {
  let sub: (...args: any[]) => void = () => {};
  return {
    subscribe: (fn: (...args: any[]) => void) => {
      sub = fn;
    },
    update: (...args: any[]) => sub(...args)
  };
};

// @placeholder
type TRenderer<T> = (
  consumer: TConsumer<T, TFields>,
  validate: TValidator<TFields>,
  dom: HTMLElement,
  updateState: (fields: TFields) => void,
  fields: TFields,
  commands: TCommands,
  subscribe: (
    fn: (fields: TFields, commands: ReturnType<TCommandCreator>) => void
  ) => void
) => void;

const mount = <RenderReturn>(render: TRenderer<RenderReturn>) => <
  FieldAttrs extends TFields
>(
  consumer: TConsumer<RenderReturn, FieldAttrs>,
  validate: TValidator<TFields>,
  defaultState: FieldAttrs
): TEmbed<FieldAttrs> => (dom, updateState, fields, commands) => {
  const updater = createUpdater();
  render(
    consumer,
    validate,
    dom,
    fields => updateState(fields, !!validate(fields)),
    Object.assign({}, defaultState, fields),
    commands,
    updater.subscribe
  );
  return updater.update;
};

export default mount;
