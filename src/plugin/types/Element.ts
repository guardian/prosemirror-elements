import type { Schema } from "prosemirror-model";
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
  FieldNameToValueMap,
  FieldTypeToViewMap,
} from "../fieldViews/helpers";
import type {
  RichTextFieldDescription,
  RichTextFieldView,
} from "../fieldViews/RichTextFieldView";
import type {
  TextFieldDescription,
  TextFieldView,
} from "../fieldViews/TextFieldView";
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

export type Transformers<
  FDesc extends FieldDescriptions<string>,
  ExternalData
> = {
  transformElementDataIn: (
    inputData: ExternalData
  ) => FieldNameToValueMap<FDesc>;
  transformElementDataOut: (
    outputData: FieldNameToValueMap<FDesc>
  ) => ExternalData;
};

export type ElementSpec<
  FDesc extends FieldDescriptions<string>,
  ExternalData = unknown
> = {
  fieldDescriptions: FDesc;
  transformers?: Transformers<FDesc, ExternalData>;
  createUpdator: (
    dom: HTMLElement,
    fields: FieldNameToField<FDesc>,
    updateState: (
      fields: FieldNameToValueMap<FDesc>,
      hasErrors: boolean
    ) => void,
    initFields: FieldNameToValueMap<FDesc>,
    commands: ReturnType<CommandCreator>
  ) => (
    fields: FieldNameToValueMap<FDesc>,
    commands: ReturnType<CommandCreator>
  ) => void;
};

export type ElementSpecMap<
  FDesc extends FieldDescriptions<string>,
  ElementNames extends string,
  ExternalData = unknown
> = Record<ElementNames, ElementSpec<FDesc, ExternalData>>;

export type ExtractFieldValues<ESpec> = ESpec extends ElementSpec<
  infer F,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- we don't need this type.
  infer E
>
  ? FieldNameToValueMap<F>
  : never;

export type ExtractExternalData<ESpec> = ESpec extends ElementSpec<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- we don't need this type.
  infer F,
  infer E
>
  ? E
  : never;

// Construct a union of the possible element data values from an ElementSpec.
export type ExtractDataTypeFromElementSpec<T, U> = U extends keyof T
  ? {
      elementName: U;
      values: ExtractExternalData<T[U]> extends Record<string, unknown>
        ? ExtractExternalData<T[U]>
        : ExtractFieldValues<T[U]>;
    }
  : never;

export type ExtractPartialDataTypeFromElementSpec<T, U> = U extends keyof T
  ? {
      elementName: U;
      values: ExtractExternalData<T[U]> extends Record<string, unknown>
        ? Partial<ExtractExternalData<T[U]>>
        : Partial<ExtractFieldValues<T[U]>>;
    }
  : never;
