import type { FieldNameToValueMap } from "./fieldViews/helpers";
import type { CommandCreator, Commands } from "./types/Commands";
import type {
  ElementSpec,
  FieldDescriptions,
  FieldNameToField,
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
  // Fields is partial to allow for validating an incomplete element representation
  fields: Partial<FieldNameToValueMap<FDesc>>
) => undefined | FieldValidationErrors;

export type FieldValidator = (
  fieldValue: unknown,
  fieldName: string
) => ValidationError[];

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

export const createElementSpec = <FDesc extends FieldDescriptions<string>>(
  fieldDescriptions: FDesc,
  render: Renderer<FDesc>,
  validate: Validator<FDesc> | undefined = undefined
): ElementSpec<FDesc> => {
  const validateWithFieldAndElementValidators: Validator<FDesc> = (
    fields: Partial<FieldNameToValueMap<FDesc>>
  ) => {
    const fieldErrors: FieldValidationErrors = {};
    for (const field in fieldDescriptions) {
      const validators = fieldDescriptions[field].validators;
      if (validators && validators.length > 0) {
        validators.forEach((validate) => {
          const value = fields[field];
          fieldErrors[field] = [...validate(value, field)];
        });
      }
    }

    const elementErrors = validate ? validate(fields) : {};

    const allErrors = { ...elementErrors, ...fieldErrors };

    return Object.keys(allErrors).length > 0 ? allErrors : undefined;
  };

  return {
    fieldDescriptions,
    validate: validateWithFieldAndElementValidators,
    createUpdator: (dom, fields, updateState, fieldValues, commands) => {
      const updater = createUpdater<FDesc>();
      render(
        validateWithFieldAndElementValidators,
        dom,
        fields,
        (fields) => updateState(fields),
        fieldValues,
        commands,
        updater.subscribe
      );
      return updater.update;
    },
  };
};
