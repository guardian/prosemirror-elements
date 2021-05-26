import { getNodeSpecFromFieldSpec } from "./nodeSpec";
import type { FieldNameToValueMap } from "./nodeViews/helpers";
import type { TCommandCreator, TCommands } from "./types/Commands";
import type { TConsumer } from "./types/Consumer";
import type {
  FieldNameToNodeViewSpec,
  FieldSpec,
  EmbedSpec,
} from "./types/Embed";

type Subscriber<FSpec extends FieldSpec<string>> = (
  fields: FieldNameToValueMap<FSpec>,
  commands: ReturnType<TCommandCreator>
) => void;

type Updater<FSpec extends FieldSpec<string>> = {
  update: Subscriber<FSpec>;
  subscribe: (s: Subscriber<FSpec>) => void;
};

const createUpdater = <FSpec extends FieldSpec<string>>(): Updater<FSpec> => {
  let sub: Subscriber<FSpec> = () => undefined;
  return {
    subscribe: (fn) => {
      sub = fn;
    },
    update: (fields, commands) => sub(fields, commands),
  };
};

export type Validator<FSpec extends FieldSpec<string>> = (
  fields: FieldNameToValueMap<FSpec>
) => null | Record<string, string[]>;

export type TRenderer<RendererOutput, FSpec extends FieldSpec<string>> = (
  consumer: TConsumer<RendererOutput, FSpec>,
  validate: Validator<FSpec>,
  // The HTMLElement representing the node parent. The renderer can mount onto this node.
  dom: HTMLElement,
  // The HTMLElement representing the node's children, if there are any. The renderer can
  // choose to append this node if it needs to render children.
  nodeViewPropMap: FieldNameToNodeViewSpec<FSpec>,
  updateState: (fields: FieldNameToValueMap<FSpec>) => void,
  fields: FieldNameToValueMap<FSpec>,
  commands: TCommands,
  subscribe: (
    fn: (
      fields: FieldNameToValueMap<FSpec>,
      commands: ReturnType<TCommandCreator>
    ) => void
  ) => void
) => void;

export const createEmbedSpec = <
  RenderOutput,
  FSpec extends FieldSpec<string>,
  EmbedName extends string
>(
  name: EmbedName,
  fieldSpec: FSpec,
  render: TRenderer<RenderOutput, FSpec>,
  consumer: TConsumer<RenderOutput, FSpec>,
  validate: Validator<FSpec>,
  defaultState: Partial<FieldNameToValueMap<FSpec>>
): EmbedSpec<FSpec, EmbedName> => ({
  name,
  fieldSpec,
  nodeSpec: getNodeSpecFromFieldSpec(name, fieldSpec),
  createUpdator: (dom, nestedEditors, updateState, fields, commands) => {
    const updater = createUpdater<FSpec>();
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
