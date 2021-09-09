import type { FieldNameToValueMap } from "./fieldViews/helpers";
import type { CommandCreator, Commands } from "./types/Commands";
import type {
  ElementSpec,
  FieldDescriptions,
  FieldNameToField,
  Transformers,
} from "./types/Element";

type Subscriber<FDesc extends FieldDescriptions<string>> = (
  fields: FieldNameToValueMap<FDesc>,
  commands: ReturnType<CommandCreator>
) => void;

type Updater<FDesc extends FieldDescriptions<string>> = {
  update: Subscriber<FDesc>;
  subscribe: (s: Subscriber<FDesc>) => void;
};

const createUpdater = <
  FDesc extends FieldDescriptions<string>
>(): Updater<FDesc> => {
  let sub: Subscriber<FDesc> = () => undefined;
  return {
    subscribe: (fn) => {
      sub = fn;
    },
    update: (fields, commands) => sub(fields, commands),
  };
};

export type ValidationError = {
  error: string;
  message: string;
};
export type FieldValidationErrors = Record<string, ValidationError[]>;

export type Validator<FDesc extends FieldDescriptions<string>> = (
  fields: FieldNameToValueMap<FDesc>
) => undefined | FieldValidationErrors;

export type Renderer<FDesc extends FieldDescriptions<string>> = (
  validate: Validator<FDesc>,
  // The HTMLElement representing the node parent. The renderer can mount onto this node.
  dom: HTMLElement,
  // The HTMLElement representing the node's children, if there are any. The renderer can
  // choose to append this node if it needs to render children.
  fields: FieldNameToField<FDesc>,
  updateState: (fields: FieldNameToValueMap<FDesc>) => void,
  fieldValues: FieldNameToValueMap<FDesc>,
  commands: Commands,
  subscribe: (
    fn: (
      fields: FieldNameToValueMap<FDesc>,
      commands: ReturnType<CommandCreator>
    ) => void
  ) => void
) => void;

export const createElementSpec = <
  FDesc extends FieldDescriptions<string>,
  ExternalData
>(
  fieldDescriptions: FDesc,
  render: Renderer<FDesc>,
  validate: Validator<FDesc>,
  transformers?: Transformers<FDesc, ExternalData>
): ElementSpec<FDesc, ExternalData> => ({
  fieldDescriptions,
  transformers,
  validate,
  createUpdator: (dom, fields, updateState, fieldValues, commands) => {
    const updater = createUpdater<FDesc>();
    render(
      validate,
      dom,
      fields,
      (fields) => updateState(fields),
      fieldValues,
      commands,
      updater.subscribe
    );
    return updater.update;
  },
});
