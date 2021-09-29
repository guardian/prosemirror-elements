import type { Node } from "prosemirror-model";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { CheckboxFieldView } from "../fieldViews/CheckboxFieldView";
import type { CheckboxValue } from "../fieldViews/CheckboxFieldView";
import type { CustomFieldDescription } from "../fieldViews/CustomFieldView";
import { CustomFieldView } from "../fieldViews/CustomFieldView";
import { DropdownFieldView } from "../fieldViews/DropdownFieldView";
import { RichTextFieldView } from "../fieldViews/RichTextFieldView";
import { TextFieldView } from "../fieldViews/TextFieldView";
import type { FieldDescription, FieldDescriptions } from "../types/Element";
import type { KeysWithValsOfType, Optional } from "./types";

export const fieldTypeToViewMap = {
  [TextFieldView.fieldName]: TextFieldView,
  [RichTextFieldView.fieldName]: RichTextFieldView,
  [CheckboxFieldView.fieldName]: CheckboxFieldView,
  [DropdownFieldView.fieldName]: DropdownFieldView,
  [CustomFieldView.fieldName]: CustomFieldView,
};

export type FieldTypeToViewMap<Field> = {
  [TextFieldView.fieldName]: TextFieldView;
  [RichTextFieldView.fieldName]: RichTextFieldView;
  [CheckboxFieldView.fieldName]: CheckboxFieldView;
  [DropdownFieldView.fieldName]: DropdownFieldView;
  [CustomFieldView.fieldName]: Field extends CustomFieldDescription<infer Data>
    ? CustomFieldView<Data>
    : never;
};

/**
 * A map from all FieldView types to the serialised values they create at runtime.
 */
export type FieldTypeToValueMap<
  FDesc extends FieldDescriptions<string>,
  Name extends keyof FDesc
> = {
  [TextFieldView.fieldName]: string;
  [RichTextFieldView.fieldName]: string;
  [CheckboxFieldView.fieldName]: CheckboxValue;
  [DropdownFieldView.fieldName]: string;
  [CustomFieldView.fieldName]: FDesc[Name] extends CustomFieldDescription<
    infer Data
  >
    ? Data
    : never;
};

/**
 * Get the values that would be provided by the given FieldDescriptions at runtime,
 * keyed by their names. For example, for the FieldDescriptions:
 *
 * `{ altText: { type: "richText" }, isVisible: { type: "checkbox" }}`
 *
 * The resulting type would be:
 *
 * `{ altText: string }, { isVisible: { value: boolean }}`
 */
export type FieldNameToValueMap<
  FDesc extends FieldDescriptions<keyof FDesc>
> = {
  [Name in keyof FDesc]: FieldTypeToValueMap<FDesc, Name>[FDesc[Name]["type"]];
};

/**
 * As with `FieldNameToValueMap`, but respects the `absentOnEmpty` value
 * to produce a result that reflects the output type of `getElementDataFromNode`.
 */
export type FieldNameToValueMapWithEmptyValues<
  FDesc extends FieldDescriptions<keyof FDesc>
> = Optional<
  FieldNameToValueMap<FDesc>,
  KeysWithValsOfType<FDesc, { absentOnEmpty: true }>
>;

type Options = {
  node: Node;
  view: EditorView;
  getPos: () => number;
  offset: number;
  innerDecos: Decoration[] | DecorationSet;
};

export const getElementFieldViewFromType = (
  field: FieldDescription,
  { node, view, getPos, offset, innerDecos }: Options
) => {
  switch (field.type) {
    case "text":
      return new TextFieldView(node, view, getPos, offset, innerDecos, field);
    case "richText":
      return new RichTextFieldView(
        node,
        view,
        getPos,
        offset,
        innerDecos,
        field
      );
    case "checkbox":
      return new CheckboxFieldView(
        node,
        view,
        getPos,
        offset,
        field.defaultValue ?? CheckboxFieldView.defaultValue
      );
    case "custom":
      return new CustomFieldView(node, view, getPos, offset);
    case "dropdown":
      return new DropdownFieldView(
        node,
        view,
        getPos,
        offset,
        field.defaultValue ?? DropdownFieldView.defaultValue,
        field.options
      );
  }
};
