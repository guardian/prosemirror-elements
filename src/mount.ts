import { getNodeSpecFromProps } from "./baseSchema";
import type { TCommandCreator, TCommands } from "./types/Commands";
import type { TConsumer } from "./types/Consumer";
import type {
  ElementProps,
  NestedEditorMapFromProps,
  TEmbed,
} from "./types/Embed";
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

export type TRenderer<RendererOutput, Props extends ElementProps> = (
  consumer: TConsumer<RendererOutput, Props>,
  validate: TValidator,
  // The HTMLElement representing the node parent. The renderer can mount onto this node.
  dom: HTMLElement,
  // The HTMLElement representing the node's children, if there are any. The renderer can
  // choose to append this node if it needs to render children.
  nestedEditors: NestedEditorMapFromProps<Props>,
  updateState: (fields: TFields) => void,
  fields: TFields,
  commands: TCommands,
  subscribe: (
    fn: (fields: TFields, commands: ReturnType<TCommandCreator>) => void
  ) => void
) => void;

export const mount = <
  RenderOutput,
  Props extends ElementProps,
  Name extends string
>(
  name: Name,
  props: Props,
  render: TRenderer<RenderOutput, Props>,
  consumer: TConsumer<RenderOutput, Props>,
  validate: TValidator,
  defaultState: TFields
): TEmbed<Props, Name> => ({
  name,
  nodeSpec: getNodeSpecFromProps(name, props),
  createEmbed: (dom, nestedEditors, updateState, fields, commands) => {
    const updater = createUpdater();
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
  },
});
