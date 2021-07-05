import { redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import type { Node } from "prosemirror-model";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { ProseMirrorFieldView } from "./ProseMirrorFieldView";

export class TextFieldView extends ProseMirrorFieldView {
  public static fieldName = "text" as const;

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
    decorations: DecorationSet | Decoration[]
  ) {
    super(
      node,
      outerView,
      getPos,
      offset,
      decorations,
      TextFieldView.fieldName,
      [
        keymap({
          "Mod-z": () => undo(outerView.state, outerView.dispatch),
          "Mod-y": () => redo(outerView.state, outerView.dispatch),
        }),
      ]
    );
  }
}
