import type { Schema } from "prosemirror-model";
import type { Validator } from "../elementSpec";
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
import type {
  RichTextFieldDescription,
  RichTextFieldView,
} from "../fieldViews/RichTextFieldView";
import type {
  TextFieldDescription,
  TextFieldView,
} from "../fieldViews/TextFieldView";
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
  | DropdownFieldDescription;

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

export type NonCustomFieldViews =
  | TextFieldView
  | RichTextFieldView
  | CheckboxFieldView;

export interface Field<F> {
  view: F;
  description: FieldDescription;
  name: string;
  update: (value: F extends FieldView<infer Value> ? Value : never) => void;
}

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
    : Field<FieldTypeToViewMap<FDesc[name]>[FDesc[name]["type"]]>;
};

export type ElementSpec<FDesc extends FieldDescriptions<string>> = {
  fieldDescriptions: FDesc;
  validate: Validator<FDesc>;
  createUpdator: (
    dom: HTMLElement,
    fields: FieldNameToField<FDesc>,
    updateState: (fields: FieldNameToValueMap<FDesc>) => void,
    initFields: FieldNameToValueMap<FDesc>,
    commands: ReturnType<CommandCreator>
  ) => (
    fields: FieldNameToValueMap<FDesc>,
    commands: ReturnType<CommandCreator>
  ) => void;
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
