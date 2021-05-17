import { getNodeSpecFromProps } from "./nodeSpec";
import type { NodeViewPropValues } from "./nodeViews/helpers";
import type { TCommandCreator, TCommands } from "./types/Commands";
import type { TConsumer } from "./types/Consumer";
import type { EmbedProps, NodeViewPropMap, TEmbed } from "./types/Embed";

type Subscriber<Props extends EmbedProps<string>> = (
  fields: NodeViewPropValues<Props>,
  commands: ReturnType<TCommandCreator>
) => void;

type Updater<Props extends EmbedProps<string>> = {
  update: Subscriber<Props>;
  subscribe: (s: Subscriber<Props>) => void;
};

const createUpdater = <Props extends EmbedProps<string>>(): Updater<Props> => {
  let sub: Subscriber<Props> = () => undefined;
  return {
    subscribe: (fn) => {
      sub = fn;
    },
    update: (fields, commands) => sub(fields, commands),
  };
};

export type Validator<Props extends EmbedProps<string>> = (
  fields: NodeViewPropValues<Props>
) => null | Record<string, string[]>;

export type TRenderer<RendererOutput, Props extends EmbedProps<string>> = (
  consumer: TConsumer<RendererOutput, Props>,
  validate: Validator<Props>,
  // The HTMLElement representing the node parent. The renderer can mount onto this node.
  dom: HTMLElement,
  // The HTMLElement representing the node's children, if there are any. The renderer can
  // choose to append this node if it needs to render children.
  nodeViewPropMap: NodeViewPropMap<Props>,
  updateState: (fields: NodeViewPropValues<Props>) => void,
  fields: NodeViewPropValues<Props>,
  commands: TCommands,
  subscribe: (
    fn: (
      fields: NodeViewPropValues<Props>,
      commands: ReturnType<TCommandCreator>
    ) => void
  ) => void
) => void;

export const mount = <
  RenderOutput,
  Props extends EmbedProps<string>,
  Name extends string
>(
  name: Name,
  props: Props,
  render: TRenderer<RenderOutput, Props>,
  consumer: TConsumer<RenderOutput, Props>,
  validate: Validator<Props>,
  defaultState: NodeViewPropValues<Props>
): TEmbed<Props, Name> => ({
  name,
  props,
  nodeSpec: getNodeSpecFromProps(name, props),
  createUpdator: (dom, nestedEditors, updateState, fields, commands) => {
    const updater = createUpdater<Props>();
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
