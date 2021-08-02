import type { Schema } from "prosemirror-model";
import type {
  CheckboxField,
  CheckboxFieldView,
} from "../fieldViews/CheckboxFieldView";
import type {
  CustomField,
  CustomFieldView,
} from "../fieldViews/CustomFieldView";
import type {
  DropdownField,
  DropdownFieldView,
} from "../fieldViews/DropdownFieldView";
import type {
  FieldNameToValueMap,
  FieldTypeToViewMap,
} from "../fieldViews/helpers";
import type {
  RichTextField,
  RichTextFieldView,
} from "../fieldViews/RichTextFieldView";
import type { TextField, TextFieldView } from "../fieldViews/TextFieldView";
import type { CommandCreator } from "./Commands";

export type Field =
  | TextField
  | RichTextField
  | CheckboxField
  | CustomField
  | DropdownField;

export type FieldSpec<Names extends string> = Record<Names, Field>;

export type SchemaFromElementFieldSpec<
  FSpec extends FieldSpec<string>
> = Schema<Extract<keyof FSpec, string>>;

export type FieldViews =
  | TextFieldView
  | RichTextFieldView
  | CheckboxFieldView
  | CustomFieldView
  | DropdownFieldView;

export type FieldViewSpec<FieldView extends FieldViews> = {
  fieldView: FieldView;
  fieldSpec: Field;
  name: string;
};

export type CustomFieldViewSpec<Data = unknown, Props = unknown> = {
  fieldView: CustomFieldView<Data>;
  fieldSpec: CustomField<Data, Props>;
  name: string;
};

export type FieldNameToFieldViewSpec<FSpec extends FieldSpec<string>> = {
  [name in Extract<keyof FSpec, string>]: FSpec[name] extends CustomField<
    infer Data,
    infer Props
  >
    ? CustomFieldViewSpec<Data, Props>
    : FieldViewSpec<FieldTypeToViewMap<FSpec[name]>[FSpec[name]["type"]]>;
};

export type ElementSpec<FSpec extends FieldSpec<string>> = {
  fieldSpec: FSpec;
  createUpdator: (
    dom: HTMLElement,
    fields: FieldNameToFieldViewSpec<FSpec>,
    updateState: (
      fields: FieldNameToValueMap<FSpec>,
      hasErrors: boolean
    ) => void,
    initFields: FieldNameToValueMap<FSpec>,
    commands: ReturnType<CommandCreator>
  ) => (
    fields: FieldNameToValueMap<FSpec>,
    commands: ReturnType<CommandCreator>
  ) => void;
};

export type ElementSpecMap<
  FSpec extends FieldSpec<string>,
  ElementNames extends string
> = Record<ElementNames, ElementSpec<FSpec>>;

export type ExtractFieldValues<ESpec> = Partial<
  ESpec extends ElementSpec<infer F> ? FieldNameToValueMap<F> : never
>;
