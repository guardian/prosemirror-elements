import type { NodeSpec, Schema } from "prosemirror-model";
import type { CheckboxNodeView } from "../nodeViews/CheckboxNodeView";
import type { FieldNameToValueMap } from "../nodeViews/helpers";
import type { RTENodeView } from "../nodeViews/RTENodeView";
import type { CommandCreator } from "./Commands";

/**
 * The specification for an embed field, to be modelled as a Node in Prosemirror.
 */
interface BaseFieldSpec<DefaultValue extends unknown> {
  // The data type of the field.
  type: string;
  defaultValue?: DefaultValue;
}

interface CheckboxField extends BaseFieldSpec<{ value: boolean }> {
  type: typeof CheckboxNodeView.propName;
}

interface RTEField
  extends BaseFieldSpec<string>,
    Partial<Pick<NodeSpec, "toDOM" | "parseDOM" | "content">> {
  type: typeof RTENodeView.propName;
}

export type Field = RTEField | CheckboxField;

export type FieldSpec<Names extends string> = Record<Names, Field>;

export type SchemaFromEmbedFieldSpec<FSpec extends FieldSpec<string>> = Schema<
  Extract<keyof FSpec, string>
>;

export type FieldNodeViews = RTENodeView | CheckboxNodeView;

export type FieldNodeViewSpec = {
  nodeView: FieldNodeViews;
  fieldSpec: Field;
  name: string;
};

export type FieldNameToNodeViewSpec<FSpec extends FieldSpec<string>> = {
  [name in Extract<keyof FSpec, string>]: FieldNodeViewSpec;
};

export type EmbedSpec<
  FSpec extends FieldSpec<string>,
  EmbedName extends string
> = {
  name: EmbedName;
  fieldSpec: FSpec;
  nodeSpec: NodeSpec;
  createUpdator: (
    dom: HTMLElement,
    fields: FieldNameToNodeViewSpec<FSpec>,
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
