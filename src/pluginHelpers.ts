import type { Node } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { CheckboxFieldView } from "./fieldViews/CheckboxFieldView";
import { CustomFieldView } from "./fieldViews/CustomFieldView";
import { RichTextFieldView } from "./fieldViews/RichTextFieldView";
import { TextFieldView } from "./fieldViews/TextFieldView";
import type { Field } from "./types/Element";

export const temporaryHardcodedSchema = new Schema({
  nodes: schema.spec.nodes,
  marks: schema.spec.marks,
});

type Options = {
  node: Node;
  view: EditorView;
  getPos: () => number;
  offset: number;
  innerDecos: Decoration[] | DecorationSet;
};

export const getElementFieldViewFromType = (
  prop: Field,
  { node, view, getPos, offset, innerDecos }: Options
) => {
  switch (prop.type) {
    case "text":
      return new TextFieldView(node, view, getPos, offset, innerDecos);
    case "richText":
      return new RichTextFieldView(
        node,
        view,
        getPos,
        offset,
        temporaryHardcodedSchema,
        innerDecos
      );
    case "checkbox":
      return new CheckboxFieldView(
        node,
        view,
        getPos,
        offset,
        prop.defaultValue ?? CheckboxFieldView.defaultValue
      );
    case "custom":
      return new CustomFieldView(node, view, getPos, offset);
  }
};
