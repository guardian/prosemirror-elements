import type { NodeSpec, Schema } from "prosemirror-model";
import type { CheckboxFieldView } from "../fieldViews/CheckboxFieldView";
import type { CustomFieldView } from "../fieldViews/CustomFieldView";
import type { DropdownFieldView } from "../fieldViews/DropdownFieldView";
import type {
  FieldNameToValueMap,
  FieldTypeToViewMap,
} from "../fieldViews/helpers";
import type { RichTextFieldView } from "../fieldViews/RichTextFieldView";
import type { TextFieldView } from "../fieldViews/TextFieldView";
import type { CommandCreator } from "./Commands";

/**
 * The specification for an element field, to be modelled as a Node in Prosemirror.
 */
interface BaseFieldSpec<DefaultValue extends unknown> {
  // The data type of the field.
  type: string;
  defaultValue?: DefaultValue;
}

interface CheckboxField extends BaseFieldSpec<{ value: boolean }> {
  type: typeof CheckboxFieldView.propName;
}

export type Option<Value> = {
  text: string;
  value: Value;
};

interface DropdownField<Data = unknown> extends BaseFieldSpec<Data> {
  type: typeof DropdownFieldView.propName;
  options: ReadonlyArray<Option<Data>>;
}

interface RichTextField
  extends BaseFieldSpec<string>,
    Partial<Pick<NodeSpec, "toDOM" | "parseDOM" | "content">> {
  type: typeof RichTextFieldView.propName;
}

interface TextField extends BaseFieldSpec<string> {
  type: typeof TextFieldView.propName;
}

export interface CustomField<Data = unknown, Props = unknown>
  extends BaseFieldSpec<Data> {
  type: typeof CustomFieldView.propName;
  defaultValue: Data;
  props: Props;
}

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

export type ElementSpec<
  FSpec extends FieldSpec<string>,
  ElementName extends string
> = {
  name: ElementName;
  fieldSpec: FSpec;
  nodeSpec: NodeSpec;
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
