import type OrderedMap from "orderedmap";
import { exampleSetup } from "prosemirror-example-setup";
import { redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { Schema } from "prosemirror-model";
import type { Node, NodeSpec } from "prosemirror-model";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { getNodeSpecForProp } from "../nodeSpec";
import type { Field } from "../types/Element";
import { ProseMirrorFieldView } from "./ProseMirrorFieldView";

const addRootNodeToSchema = (schema: Schema, propName: string, field: Field) =>
  new Schema({
    nodes: (schema.spec.nodes as OrderedMap<NodeSpec>)
      .append(getNodeSpecForProp("noop", propName, field))
      .remove("doc"),
    marks: schema.spec.marks,
    topNode: propName,
  });

export class RichTextFieldView extends ProseMirrorFieldView {
  public static propName = "richText" as const;

  constructor(
    // The field this FieldView represents.
    field: Field,
    // The node that this FieldView is responsible for rendering.
    node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    getPos: () => number,
    // The offset of this node relative to its parent FieldView.
    offset: number,
    // The schema that the internal editor should use.
    schema: Schema,
    // The initial decorations for the FieldView.
    decorations: DecorationSet | Decoration[]
  ) {
    const localSchema = addRootNodeToSchema(schema, node.type.name, field);
    super(
      node,
      outerView,
      getPos,
      offset,
      localSchema,
      decorations,
      RichTextFieldView.propName,
      [
        keymap({
          "Mod-z": () => undo(outerView.state, outerView.dispatch),
          "Mod-y": () => redo(outerView.state, outerView.dispatch),
        }),
        ...exampleSetup({ schema: localSchema }),
      ]
    );
  }
}
