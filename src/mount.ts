import type { TCommandCreator, TCommands } from "./types/Commands";
import type { TConsumer } from "./types/Consumer";
import type { TEmbed } from "./types/Embed";
import type { TFields } from "./types/Fields";
import type { TValidator } from "./types/Validator";

const createUpdater = () => {
  let sub: Subscriber = () => undefined;
  return {
    subscribe: (fn: Subscriber) => {
      sub = fn;
    },
    update: ((fields, commands) => sub(fields, commands)) as Subscriber,
  };
};

type Subscriber = (
  fields: TFields,
  commands: ReturnType<TCommandCreator>
) => void;

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

export const mount = <RenderReturn>(render: TRenderer<RenderReturn>) => <
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
    (fields) => updateState(fields, !!validate(fields)),
    Object.assign({}, defaultState, fields),
    commands,
    updater.subscribe
  );
  return updater.update;
};
