import type { TCommandCreator, TCommands } from "./types/Commands";
import type { TConsumer } from "./types/Consumer";
import type { ElementProps, NestedEditorMap, TEmbed } from "./types/Embed";
import type { TFields } from "./types/Fields";
import type { TValidator } from "./types/Validator";

type Subscriber = (
  fields: TFields,
  commands: ReturnType<TCommandCreator>
) => void;

type Updater = {
  update: Subscriber;
  subscribe: (s: Subscriber) => void;
};

const createUpdater = (): Updater => {
  let sub: Subscriber = () => undefined;
  return {
    subscribe: (fn) => {
      sub = fn;
    },
    update: (fields, commands) => sub(fields, commands),
  };
};

type TRenderer<T> = (
  consumer: TConsumer<T>,
  validate: TValidator,
  // The HTMLElement representing the node parent. The renderer can mount onto this node.
  dom: HTMLElement,
  // The HTMLElement representing the node's children, if there are any. The renderer can
  // choose to append this node if it needs to render children.
  nestedEditors: NestedEditorMap,
  updateState: (fields: TFields) => void,
  fields: TFields,
  commands: TCommands,
  subscribe: (
    fn: (fields: TFields, commands: ReturnType<TCommandCreator>) => void
  ) => void
) => void;

<<<<<<< HEAD
export const mount = <RenderReturn>(render: TRenderer<RenderReturn>) => (
  consumer: TConsumer<RenderReturn>,
  validate: TValidator,
  defaultState: TFields
): TEmbed => (dom, nestedEditors, updateState, fields, commands) => {
  const updater = createUpdater();
=======
export const mount = <FieldAttrs extends TFields, RenderReturn>(
  render: TRenderer<RenderReturn, FieldAttrs>
) => (
  consumer: TConsumer<RenderReturn, FieldAttrs>,
  validate: TValidator<FieldAttrs>,
  defaultState: FieldAttrs
): TEmbed<FieldAttrs, Readonly<ElementProps[]>> => (
  dom,
  nestedEditors,
  updateState,
  fields,
  commands
) => {
  const updater = createUpdater<FieldAttrs>();
>>>>>>> 322e5d9... Patch types pending full polymorphism
  render(
    consumer,
    validate,
    dom,
    nestedEditors,
    (fields) => updateState(fields, !!validate(fields)),
    Object.assign({}, defaultState, fields),
    commands,
    updater.subscribe
  );
  return updater.update;
};
