import TFields from './types/Fields';
import TEmbed from './types/Embed';
import TErrors from './types/Errors';
import TConsumer from './types/Consumer';
import TValidator from './types/Validator';
import { TCommands } from './types/Commands';
import createStore, { TState } from './createStore';

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
  dom: HTMLElement,
  initState: TState,
  consume: (fields: TFields, commands: TCommands) => T,
  subscribe: (fn: (state: TState) => void) => void
) => void;

const mount = <RenderReturn>(render: TRenderer<RenderReturn>) => <FieldAttrs extends TFields>(
  consumer: TConsumer<RenderReturn, FieldAttrs>,
  validate: TValidator<TFields>,
  defaultFields: FieldAttrs
): TEmbed<FieldAttrs> => (dom, updateState, fields, commands) => {
  const store = createStore(Object.assign(defaultFields, fields), commands);

  store.subscribe(({ fields }, rebuild) => {
    if (rebuild) {
      return;
    }
    // currently uses setTimeout to make sure the view is ready as this can
    // be called on view load
    // PR open https://github.com/ProseMirror/prosemirror-view/pull/34
    setTimeout(() => updateState(fields, !!validate(fields)));
  });

  store.runSubscribers();

  render(
    dom,
    store.getState(),
    (fields: FieldAttrs, commands: TCommands) =>
      consumer(
        fields,
        fieldErrors(fields, validate(fields)),
        commands,
        store.update
      ),
    store.subscribe
  );
  return (fields: FieldAttrs, commands: TCommands) =>
    store.rebuild({
      fields: Object.assign(defaultFields, fields),
      commands
    });
};

export default mount;
