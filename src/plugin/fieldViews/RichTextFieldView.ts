import { exampleSetup } from "prosemirror-example-setup";
import { redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import type { Node, NodeSpec, Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import type { BaseFieldSpec } from "./FieldView";
import { ProseMirrorFieldView } from "./ProseMirrorFieldView";

export interface RichTextField extends BaseFieldSpec<string> {
  type: typeof RichTextFieldView.fieldName;
  createPlugins?: (schema: Schema) => Plugin[];
  nodeSpec?: Partial<NodeSpec>;
}

type RichTextOptions = {
  createPlugins?: (schema: Schema) => Plugin[];
  nodeSpec?: Partial<NodeSpec>;
};

export const createRichTextField = ({
  createPlugins,
  nodeSpec,
}: RichTextOptions): RichTextField => ({
  type: RichTextFieldView.fieldName,
  createPlugins,
  nodeSpec,
});

export const createDefaultRichTextField = (): RichTextField =>
  createRichTextField({ createPlugins: (schema) => exampleSetup({ schema }) });

export class RichTextFieldView extends ProseMirrorFieldView {
  public static fieldName = "richText" as const;

  constructor(
    // The node that this FieldView is responsible for rendering.
    node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    getPos: () => number,
    // The offset of this node relative to its parent FieldView.
    offset: number,
    // The initial decorations for the FieldView.
    decorations: DecorationSet | Decoration[],
    // The plugins passed by the consumer into the FieldView, if any.
    plugins: Plugin[]
  ) {
    super(
      node,
      outerView,
      getPos,
      offset,
      decorations,
      RichTextFieldView.fieldName,
      [
        keymap({
          "Mod-z": () => undo(outerView.state, outerView.dispatch),
          "Mod-y": () => redo(outerView.state, outerView.dispatch),
        }),
        ...plugins,
      ]
    );
  }
}
