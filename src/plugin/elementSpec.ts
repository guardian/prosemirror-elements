import type { FieldNameToValueMap } from "./fieldViews/helpers";
import type { CommandCreator, Commands } from "./types/Commands";
import type {
  ElementSpec,
  FieldNameToFieldViewSpec,
  FieldSpec,
} from "./types/Element";

type Subscriber<FSpec extends FieldSpec<string>> = (
  fields: FieldNameToValueMap<FSpec>,
  commands: ReturnType<CommandCreator>
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

export type Renderer<FSpec extends FieldSpec<string>> = (
  validate: Validator<FSpec>,
  // The HTMLElement representing the node parent. The renderer can mount onto this node.
  dom: HTMLElement,
  // The HTMLElement representing the node's children, if there are any. The renderer can
  // choose to append this node if it needs to render children.
  fieldViewSpecs: FieldNameToFieldViewSpec<FSpec>,
  updateState: (fields: FieldNameToValueMap<FSpec>) => void,
  fields: FieldNameToValueMap<FSpec>,
  commands: Commands,
  subscribe: (
    fn: (
      fields: FieldNameToValueMap<FSpec>,
      commands: ReturnType<CommandCreator>
    ) => void
  ) => void
) => void;

export const createElementSpec = <FSpec extends FieldSpec<string>>(
  fieldSpec: FSpec,
  render: Renderer<FSpec>,
  validate: Validator<FSpec>,
  defaultState: Partial<FieldNameToValueMap<FSpec>>
): ElementSpec<FSpec> => ({
  fieldSpec,
  createUpdator: (dom, fields, updateState, fieldValues, commands) => {
    const updater = createUpdater<FSpec>();
    render(
      validate,
      dom,
      fields,
      (fields) => updateState(fields, !!validate(fields)),
      Object.assign({}, defaultState, fieldValues),
      commands,
      updater.subscribe
    );
    return updater.update;
  },
});
