import type { SendTelemetryEvent } from "../elements/helpers/types/TelemetryEvents";
import type { FieldNameToValueMap } from "./helpers/fieldView";
import { validateWithFieldAndElementValidators } from "./helpers/validation";
import type { CommandCreator, Commands } from "./types/Commands";
import type {
  ElementSpec,
  FieldDescriptions,
  FieldNameToField,
} from "./types/Element";

type Subscriber<FDesc extends FieldDescriptions> = (
  fields: FieldNameToValueMap<FDesc>,
  commands: ReturnType<CommandCreator>,
  isSelected: boolean
) => void;

type Updater<FDesc extends FieldDescriptions> = {
  update: Subscriber<FDesc>;
  subscribe: (s: Subscriber<FDesc>) => void;
};

const createUpdater = <FDesc extends FieldDescriptions>(): Updater<FDesc> => {
  let sub: Subscriber<FDesc> = () => undefined;
  return {
    subscribe: (fn) => {
      sub = fn;
    },
    update: (fields, commands, isSelected) => sub(fields, commands, isSelected),
  };
};

export type ErrorLevel = "ERROR" | "WARN";

export type ValidationError = {
  error: string;
  message: string;
  level: ErrorLevel;
};
export type FieldValidationErrors = Record<string, ValidationError[]>;

export type Validator<FDesc extends FieldDescriptions> = (
  // Fields is partial to allow for validating an incomplete element representation
  fields: Partial<FieldNameToValueMap<FDesc>>
) => undefined | FieldValidationErrors;

export type FieldValidator = (
  fieldValue: unknown,
  fieldName: string
) => ValidationError[];

export type Renderer<FDesc extends FieldDescriptions> = (
  validate: Validator<FDesc>,
  // The HTMLElement representing the node parent. The renderer can mount onto this node.
  dom: HTMLElement,
  // The HTMLElement representing the node's children, if there are any. The renderer can
  // choose to append this node if it needs to render children.
  fields: FieldNameToField<FDesc>,
  updateState: (fields: FieldNameToValueMap<FDesc>) => void,
  fieldValues: FieldNameToValueMap<FDesc>,
  commands: Commands,
  subscribe: (fn: Subscriber<FDesc>) => void,
  sendTelemetryEvent: SendTelemetryEvent | undefined
) => void;

export const createElementSpec = <FDesc extends FieldDescriptions>(
  fieldDescriptions: FDesc,
  render: Renderer<FDesc>,
  validateElement: Validator<FDesc> | undefined = undefined,
  destroy: (dom: HTMLElement) => void
): ElementSpec<FDesc> => {
  const validate = validateWithFieldAndElementValidators(
    fieldDescriptions,
    validateElement
  );

  return {
    fieldDescriptions,
    validate,
    createUpdator: (
      dom,
      fields,
      updateState,
      fieldValues,
      commands,
      sendTelemetryEvent
    ) => {
      const updater = createUpdater<FDesc>();
      render(
        validate,
        dom,
        fields,
        (fields) => updateState(fields),
        fieldValues,
        commands,
        updater.subscribe,
        sendTelemetryEvent
      );
      return updater.update;
    },
    destroy,
  };
};
