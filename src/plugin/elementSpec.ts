import type { Node } from "prosemirror-model";
import type { SendTelemetryEvent } from "../elements/helpers/types/TelemetryEvents";
import type { FieldNameToValueMap } from "./helpers/fieldView";
import { validateWithFieldAndElementValidators } from "./helpers/validation";
import type { CommandCreator, Commands } from "./types/Commands";
import type {
  ElementSpec,
  ExtractFieldValues,
  FieldDescriptions,
  FieldNameToField,
} from "./types/Element";

type Subscriber<FDesc extends FieldDescriptions<string>> = (
  fields: FieldNameToField<FDesc>,
  commands: ReturnType<CommandCreator>,
  isSelected: boolean
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
  fields: FieldNameToField<FDesc>,
  updateState: (fields: FieldNameToValueMap<FDesc>) => void,
  commands: Commands,
  subscribe: (fn: Subscriber<FDesc>) => void,
  sendTelemetryEvent: SendTelemetryEvent | undefined,
  getElementData: () => ExtractFieldValues<FDesc>
) => void;

export const createElementSpec = <FDesc extends FieldDescriptions<string>>(
  fieldDescriptions: FDesc,
  render: Renderer<FDesc>,
  validateElement: Validator<FDesc> | undefined = undefined,
  destroy: (dom: HTMLElement) => void
): ElementSpec<FDesc> => {
  console.log("fieldDescriptions here", fieldDescriptions)
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
      commands,
      sendTelemetryEvent,
      getElementData
    ) => {
      const updater = createUpdater<FDesc>();
      render(
        validate,
        dom,
        fields,
        (fields) => updateState(fields),
        commands,
        updater.subscribe,
        sendTelemetryEvent,
        getElementData
      );
      return updater.update;
    },
    destroy,
  };
};
