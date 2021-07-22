import type { Node } from "prosemirror-model";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { CheckboxFieldView } from "../fieldViews/CheckboxFieldView";
import { CustomFieldView } from "../fieldViews/CustomFieldView";
import { DropdownFieldView } from "../fieldViews/DropdownFieldView";
import { RichTextFieldView } from "../fieldViews/RichTextFieldView";
import { TextFieldView } from "../fieldViews/TextFieldView";
import type { Field } from "../types/Element";

type Options = {
  node: Node;
  view: EditorView;
  getPos: () => number;
  offset: number;
  innerDecos: Decoration[] | DecorationSet;
};

export const getElementFieldViewFromType = (
  field: Field,
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
        field.createPlugins ? field.createPlugins(node.type.schema) : []
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
