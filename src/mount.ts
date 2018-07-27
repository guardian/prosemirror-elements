import TFields from './types/Fields';
import TEmbed from './types/Embed';
import TErrors from './types/Errors';
import TConsumer from './types/Consumer';
import TValidator from './types/Validator';
import { TCommands, TCommandCreator } from './types/Commands';

const createUpdater = () => {
  let sub: (...args: any[]) => void = () => {};
  return {
    subscribe: (fn: (...args: any[]) => void) => {
      sub = fn;
    },
    update: (...args: any[]) => sub(...args)
  };
};

const fieldErrors = (fields: TFields, errors: TErrors) =>
  Object.keys(fields).reduce(
    (acc, key) => ({
      ...acc,
      [key]: (errors || {})[key] || []
    }),
    {}
  );

// @placeholder
type TRenderer<T> = (
  consume: (fields: TFields, updateFields: (fields: TFields) => void) => void,
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
    (fields: FieldAttrs, updateFields) =>
      consumer(fields, fieldErrors(fields, validate(fields)), updateFields),
    dom,
    fields =>
      // currently uses setTimeout to make sure the view is ready as this can
      // be called on view load
      // PR open https://github.com/ProseMirror/prosemirror-view/pull/34
      setTimeout(() => updateState(fields, !!validate(fields))),
    Object.assign(defaultState, fields),
    commands,
    updater.subscribe
  );
  return updater.update;
};

export default mount;
