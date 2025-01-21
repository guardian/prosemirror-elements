import type { FieldNameToValueMap } from "./helpers/fieldView";
import { createElementValidator } from "./helpers/validation";
import type { CommandState } from "./types/Commands";
import type {
  CreateElementViewConfig,
  ElementSpec,
  FieldDescriptions,
  FieldNameToField,
} from "./types/Element";

type Subscriber<FDesc extends FieldDescriptions<string>> = (
  fields: FieldNameToField<FDesc>,
  commandState: CommandState,
  isSelected: boolean
) => void;

/**
 * A class for subscribing to, and publishing, updates to element-related state.
 */
export class ElementViewPublisher<FDesc extends FieldDescriptions<string>> {
  public sub: Subscriber<FDesc> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- nothing to do on class construction
  constructor() {}

  public subscribe = (fn: Subscriber<FDesc>) => (this.sub = fn);
  public update: Subscriber<FDesc> = (fields, commands, isSelected) =>
    this.sub?.(fields, commands, isSelected);
}

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

/**
 * Initialise the view for an element, providing the necessary data to display
 * it, validate it, and subscribe to updates to its state. Called when an
 * element is first added to a document.
 */
export type InitElementView<FDesc extends FieldDescriptions<string>> = (
  config: CreateElementViewConfig<FDesc> & {
    validate: Validator<FDesc>;
    subscribe: (fn: Subscriber<FDesc>) => void;
  }
) => void;

export const createElementSpec = <FDesc extends FieldDescriptions<string>>(
  fieldDescriptions: FDesc,
  initElementView: InitElementView<FDesc>,
  validateElement: Validator<FDesc> | undefined = undefined,
  destroy: (dom: HTMLElement) => void
): ElementSpec<FDesc> => {
  const validate = createElementValidator(fieldDescriptions, validateElement);

  return {
    fieldDescriptions,
    validate,
    createElementView: (config) => {
      const elementStateUpdatePublisher = new ElementViewPublisher<FDesc>();

      initElementView({
        ...config,
        validate,
        subscribe: elementStateUpdatePublisher.subscribe,
      });

      return { update: elementStateUpdatePublisher.update };
    },
    destroy,
  };
};
