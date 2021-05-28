import type { Node } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import type { CheckboxFields } from "./nodeViews/CheckboxNodeView";
import { CheckboxNodeView } from "./nodeViews/CheckboxNodeView";
import { CustomNodeView } from "./nodeViews/CustomNodeView";
import { RTENodeView } from "./nodeViews/RTENodeView";
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

export const getElementNodeViewFromType = (
  prop: Field,
  { node, view, getPos, offset, innerDecos }: Options
) => {
  switch (prop.type) {
    case "richText":
      return new RTENodeView(
        node,
        view,
        getPos,
        offset,
        temporaryHardcodedSchema,
        innerDecos
      );
    case "checkbox":
      return new CheckboxNodeView(
        node,
        view,
        getPos,
        offset,
        prop.defaultValue ?? CheckboxNodeView.defaultValue
      );
    case "custom":
      return new CustomNodeView(node, view, getPos, offset);
  }
};
