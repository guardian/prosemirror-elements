import TFields from "./types/Fields";
import TEmbedCreator from "./types/Embed";
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
  // The HTMLElement representing the node parent. The renderer can mount onto this node.
  dom: HTMLElement,
  // The HTMLElement representing the node's children, if there are any. The renderer can
  // choose to append this node if it needs to render children.
  contentDOM: HTMLElement,
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
): TEmbedCreator<FieldAttrs> => (dom, contentDOM, updateState, fields, commands) => {
  const updater = createUpdater();
  render(
    consumer,
    validate,
    dom,
    contentDOM,
    fields => updateState(fields, !!validate(fields)),
    Object.assign({}, defaultState, fields),
    commands,
    updater.subscribe
  );
  return updater.update;
};

export default mount;
