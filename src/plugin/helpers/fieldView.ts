import type { Node } from "prosemirror-model";
import type { DecorationSource, EditorView } from "prosemirror-view";
import { CheckboxFieldView } from "../fieldViews/CheckboxFieldView";
import type { CheckboxValue } from "../fieldViews/CheckboxFieldView";
import type { CustomFieldDescription } from "../fieldViews/CustomFieldView";
import { CustomFieldView } from "../fieldViews/CustomFieldView";
import { DropdownFieldView } from "../fieldViews/DropdownFieldView";
import { NestedElementFieldView } from "../fieldViews/NestedElementFieldView";
import type { RepeaterFieldDescription } from "../fieldViews/RepeaterFieldView";
import { RepeaterFieldView } from "../fieldViews/RepeaterFieldView";
import { RichTextFieldView } from "../fieldViews/RichTextFieldView";
import { TextFieldView } from "../fieldViews/TextFieldView";
import type { FieldDescription, FieldDescriptions } from "../types/Element";
import type { ExternalElementData } from "./element";
import type { KeysWithValsOfType, Optional } from "./types";
import { createNodesForFieldValues } from "../nodeSpec";

export const fieldTypeToViewMap = {
  [TextFieldView.fieldType]: TextFieldView,
  [NestedElementFieldView.fieldType]: NestedElementFieldView,
  [RichTextFieldView.fieldType]: RichTextFieldView,
  [CheckboxFieldView.fieldType]: CheckboxFieldView,
  [DropdownFieldView.fieldType]: DropdownFieldView,
  [CustomFieldView.fieldType]: CustomFieldView,
  [RepeaterFieldView.fieldType]: RepeaterFieldView,
};

export type FieldTypeToViewMap<Field> = {
  [TextFieldView.fieldType]: TextFieldView;
  [NestedElementFieldView.fieldType]: NestedElementFieldView;
  [RichTextFieldView.fieldType]: RichTextFieldView;
  [CheckboxFieldView.fieldType]: CheckboxFieldView;
  [DropdownFieldView.fieldType]: DropdownFieldView;
  [CustomFieldView.fieldType]: Field extends CustomFieldDescription<infer Data>
    ? CustomFieldView<Data>
    : never;
  [RepeaterFieldView.fieldType]: RepeaterFieldView;
};

/**
 * A map from all FieldView types to the serialised values they create at runtime.
 */
export type FieldTypeToValueMap<
  FDesc extends FieldDescriptions<string>,
  Name extends keyof FDesc
> = {
  [TextFieldView.fieldType]: string;
  [NestedElementFieldView.fieldType]: ExternalElementData[];
  [RichTextFieldView.fieldType]: string;
  [CheckboxFieldView.fieldType]: CheckboxValue;
  [DropdownFieldView.fieldType]: string;
  [CustomFieldView.fieldType]: FDesc[Name] extends CustomFieldDescription<
    infer Data
  >
    ? Data
    : never;
  [RepeaterFieldView.fieldType]: FDesc[Name] extends RepeaterFieldDescription<
    infer NestedElementFDesc
  >
    ? Array<FieldNameToValueMap<NestedElementFDesc>>
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
  FDesc extends FieldDescriptions<Extract<keyof FDesc, string>>
> = {
  [Name in keyof FDesc]: FieldTypeToValueMap<FDesc, Name>[FDesc[Name]["type"]];
};

/**
 * As with `FieldNameToValueMap`, but respects the `absentOnEmpty` value
 * to produce a result that reflects the output type of `getElementDataFromNode`.
 */
export type FieldNameToValueMapWithEmptyValues<
  FDesc extends FieldDescriptions<Extract<keyof FDesc, string>>
> = Optional<
  FieldNameToValueMap<FDesc>,
  KeysWithValsOfType<FDesc, { absentOnEmpty: true }>
>;

type Options = {
  node: Node;
  view: EditorView;
  getPos: () => number;
  offset: number;
  innerDecos: DecorationSource;
};

export const getElementFieldViewFromType = (
  fieldName: string,
  fieldDescription: FieldDescription,
  { node, view, getPos, offset, innerDecos }: Options
) => {
  switch (fieldDescription.type) {
    case "text":
      return new TextFieldView(node, view, getPos, offset, innerDecos, fieldDescription);
    case "nestedElement":
      return new NestedElementFieldView(
        node,
        view,
        getPos,
        offset,
        innerDecos,
        fieldDescription,
        fieldDescription.allowedPlugins
      );
    case "richText":
      return new RichTextFieldView(
        node,
        view,
        getPos,
        offset,
        innerDecos,
        fieldDescription
      );
    case "checkbox":
      return new CheckboxFieldView(
        node,
        view,
        getPos,
        offset,
        fieldDescription.defaultValue ?? CheckboxFieldView.defaultValue
      );
    case "custom":
      return new CustomFieldView(node, view, getPos, offset);
    case "dropdown":
      return new DropdownFieldView(
        node,
        view,
        getPos,
        offset,
        fieldDescription.defaultValue ?? DropdownFieldView.defaultValue,
        fieldDescription.options
      );
    case "repeater":
      const a = (childValue: unknown) => createNodesForFieldValues(
        node.type.schema, // got
        fieldDescription, // need (parent has)
        childValue, // got
        nodeName, // ? not sure what 'node' means here
        getNodeFromElementData, // will need (parent doesn't appear to have)
      );
      return new RepeaterFieldView(
        node,
        offset,
        getPos,
        view,
        fieldName,
        fieldDescription.minChildren,
        a
      );
  }
};
