import type { Node } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import type { CheckboxFields } from "./nodeViews/CheckboxNodeView";
import { CheckboxNodeView } from "./nodeViews/CheckboxNodeView";
import type { FieldTypeToViewMap } from "./nodeViews/helpers";
import { ImageNodeView } from "./nodeViews/ImageNodeView";
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

export const getElementNodeViewFromType = <LocalField extends Field>(
  prop: LocalField,
  { node, view, getPos, offset, innerDecos }: Options
): FieldTypeToViewMap[LocalField["type"]] => {
  switch (prop.type) {
    case "richText":
      return new RTENodeView(
        node,
        view,
        getPos,
        offset,
        temporaryHardcodedSchema,
        innerDecos
      ) as FieldTypeToViewMap[LocalField["type"]];
    case "checkbox":
      return new CheckboxNodeView(
        node,
        view,
        getPos,
        offset,
        prop.defaultValue as CheckboxFields
      ) as FieldTypeToViewMap[LocalField["type"]];
    case "image":
      return new ImageNodeView(
        node,
        view,
        getPos,
        offset
      ) as FieldTypeToViewMap[LocalField["type"]];
  }
};
