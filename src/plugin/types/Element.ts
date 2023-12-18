import type { Schema } from "prosemirror-model";
import type { SendTelemetryEvent } from "../../elements/helpers/types/TelemetryEvents";
import type { ValidationError, Validator } from "../elementSpec";
import type {
  CheckboxFieldDescription,
  CheckboxFieldView,
} from "../fieldViews/CheckboxFieldView";
import type {
  CustomFieldDescription,
  CustomFieldView,
} from "../fieldViews/CustomFieldView";
import type {
  DropdownFieldDescription,
  DropdownFieldView,
} from "../fieldViews/DropdownFieldView";
import type { FieldView } from "../fieldViews/FieldView";
import type { NestedElementFieldDescription } from "../fieldViews/NestedElementFieldView";
import type {
  RepeaterFieldDescription,
  RepeaterFieldView,
} from "../fieldViews/RepeaterFieldView";
import type {
  RichTextFieldDescription,
  RichTextFieldView,
} from "../fieldViews/RichTextFieldView";
import type {
  TextFieldDescription,
  TextFieldView,
} from "../fieldViews/TextFieldView";
import type { RepeaterFieldMapIDKey } from "../helpers/constants";
import type {
  FieldNameToValueMap,
  FieldNameToValueMapWithEmptyValues,
  FieldTypeToViewMap,
} from "../helpers/fieldView";
import type { CommandCreator } from "./Commands";

export type FieldDescription =
  | TextFieldDescription
  | RichTextFieldDescription
  | CheckboxFieldDescription
  | CustomFieldDescription
  | DropdownFieldDescription
  | NestedElementFieldDescription
  | RepeaterFieldDescription<Record<string, FieldDescription>>;

export type FieldDescriptions<Names extends string> = Record<
  Names,
  FieldDescription
>;

export type SchemaFromElementFieldDescriptions<
  FDesc extends FieldDescriptions<string>
> = Schema<Extract<keyof FDesc, string>>;

export type FieldViews =
  | TextFieldView
  | RichTextFieldView
  | CheckboxFieldView
  | CustomFieldView
  | DropdownFieldView;

export interface Field<F> {
  view: F;
  description: FieldDescription;
  name: string;
  value: F extends FieldView<infer Value> ? Value : never;
  errors: ValidationError[];
  update: (value: F extends FieldView<infer Value> ? Value : never) => void;
}

export interface RepeaterField<FDesc extends FieldDescriptions<string>> {
  view: RepeaterFieldView;
  description: RepeaterFieldDescription<FDesc>;
  name: string;
  children: Array<
    FieldNameToField<FDesc> & { [RepeaterFieldMapIDKey]: string }
  >;
}

export const isRepeaterField = <FDesc extends FieldDescriptions<string>>(
  field: Field<unknown> | RepeaterField<FDesc> | CustomField
): field is RepeaterField<FDesc> => {
  if (field.description.type === "repeater") {
    return true;
  }
  return false;
};

export interface CustomField<Data = unknown, Props = unknown>
  extends Field<CustomFieldView<Data>> {
  description: CustomFieldDescription<Data, Props>;
}

export type FieldNameToField<FDesc extends FieldDescriptions<string>> = {
  [name in Extract<
    keyof FDesc,
    string
  >]: FDesc[name] extends CustomFieldDescription<infer Data, infer Props>
    ? CustomField<Data, Props>
    : FDesc[name] extends RepeaterFieldDescription<infer FDesc>
    ? RepeaterField<FDesc>
    : Field<FieldTypeToViewMap<FDesc[name]>[FDesc[name]["type"]]>;
};

export type ElementSpec<FDesc extends FieldDescriptions<string>> = {
  fieldDescriptions: FDesc;
  validate: Validator<FDesc>;
  createUpdator: (
    dom: HTMLElement,
    fields: FieldNameToField<FDesc>,
    updateState: (fields: FieldNameToValueMap<FDesc>) => void,
    commands: ReturnType<CommandCreator>,
    sendTelemetryEvent: SendTelemetryEvent | undefined,
    getElementData: () => ExtractFieldValues<FDesc>
  ) => (
    fields: FieldNameToField<FDesc>,
    commands: ReturnType<CommandCreator>,
    isSelected: boolean
  ) => void;
  destroy: (dom: HTMLElement) => void;
};

export type ElementSpecMap<
  FDesc extends FieldDescriptions<string>,
  ElementNames extends string
> = Record<ElementNames, ElementSpec<FDesc>>;

export type ExtractFieldValues<ESpec> = ESpec extends ElementSpec<infer F>
  ? FieldNameToValueMapWithEmptyValues<F>
  : never;

// Construct a union of the possible element data values from an ElementSpec.
export type ExtractDataTypeFromElementSpec<T, U> = U extends keyof T
  ? {
      elementName: U;
      values: ExtractFieldValues<T[U]>;
    }
  : never;

export type ExtractPartialDataTypeFromElementSpec<T, U> = U extends keyof T
  ? {
      elementName: U;
      values: Partial<ExtractFieldValues<T[U]>>;
    }
  : never;
