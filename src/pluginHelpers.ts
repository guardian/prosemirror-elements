import type { Node } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import type { CheckboxFields } from "./nodeViews/CheckboxNodeView";
import { CheckboxNodeView } from "./nodeViews/CheckboxNodeView";
import { CustomNodeView } from "./nodeViews/CustomNodeView";
import type { FieldTypeToViewMap } from "./nodeViews/helpers";
import { RTENodeView } from "./nodeViews/RTENodeView";
import type { FieldSpec } from "./types/Element";

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

export const getElementNodeViewFromType = <
  FSpec extends FieldSpec<string>,
  Name extends string
>(
  prop: FSpec[Name],
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
      ) as FieldTypeToViewMap<FSpec, Name>[typeof prop["type"]];
    case "checkbox":
      return new CheckboxNodeView(
        node,
        view,
        getPos,
        offset,
        prop.defaultValue as CheckboxFields
      ) as FieldTypeToViewMap<FSpec, Name>[typeof prop["type"]];
    case "custom":
      return new CustomNodeView(
        node,
        view,
        getPos,
        offset,
        prop.defaultValue
      ) as FieldTypeToViewMap<FSpec, Name>[typeof prop["type"]];
  }
};
