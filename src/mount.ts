import type { TCommandCreator, TCommands } from "./types/Commands";
import type { TConsumer } from "./types/Consumer";
import type { NestedEditorMap, TEmbed } from "./types/Embed";
import type { TFields } from "./types/Fields";
import type { TValidator } from "./types/Validator";

type Subscriber<FieldAttrs extends TFields> = (
  fields: FieldAttrs,
  commands: ReturnType<TCommandCreator>
) => void;

type Updater<FieldAttrs extends TFields> = {
  update: Subscriber<FieldAttrs>;
  subscribe: (s: Subscriber<FieldAttrs>) => void;
};

const createUpdater = <FieldAttrs extends TFields>(): Updater<FieldAttrs> => {
  let sub: Subscriber<FieldAttrs> = () => undefined;
  return {
    subscribe: (fn) => {
      sub = fn;
    },
    update: (fields, commands) => sub(fields, commands),
  };
};

type TRenderer<T, FieldAttrs extends TFields> = (
  consumer: TConsumer<T, FieldAttrs>,
  validate: TValidator<FieldAttrs>,
  // The HTMLElement representing the node parent. The renderer can mount onto this node.
  dom: HTMLElement,
  // The HTMLElement representing the node's children, if there are any. The renderer can
  // choose to append this node if it needs to render children.
  nestedEditors: NestedEditorMap,
  updateState: (fields: Partial<FieldAttrs>) => void,
  fields: FieldAttrs,
  commands: TCommands,
  subscribe: (
    fn: (fields: FieldAttrs, commands: ReturnType<TCommandCreator>) => void
  ) => void
) => void;

export const mount = <FieldAttrs extends TFields, RenderReturn>(
  render: TRenderer<RenderReturn, FieldAttrs>
) => (
  consumer: TConsumer<RenderReturn, FieldAttrs>,
  validate: TValidator<FieldAttrs>,
  defaultState: FieldAttrs
): TEmbed<FieldAttrs> => (
  dom,
  nestedEditors,
  updateState,
  fields,
  commands
) => {
  const updater = createUpdater<FieldAttrs>();
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
