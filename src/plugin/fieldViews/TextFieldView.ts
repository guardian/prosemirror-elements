import type { Command } from "prosemirror-commands";
import { chainCommands } from "prosemirror-commands";
import { redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import type { Node, Schema } from "prosemirror-model";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import type { BaseFieldSpec } from "./FieldView";
import { ProseMirrorFieldView } from "./ProseMirrorFieldView";

export interface TextField extends BaseFieldSpec<string> {
  type: typeof TextFieldView.fieldName;
  // Can this field display over multiple lines? This will
  // insert line breaks (<br>) when the user hits the Enter key.
  isMultiline: boolean;
  // The minimum number of rows this input should occupy.
  // Analogous to the <textarea> `rows` attribute.
  rows: number;
}

type TextFieldOptions = {
  isMultiline: boolean;
  rows?: number;
};

export const createTextField = (
  { isMultiline, rows = 1 }: TextFieldOptions = { isMultiline: false, rows: 1 }
): TextField => ({
  type: TextFieldView.fieldName,
  isMultiline,
  rows,
});

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
    decorations: DecorationSet | Decoration[],
    { isMultiline, rows }: TextField
  ) {
    const keymapping: Record<string, Command> = {
      "Mod-z": () => undo(outerView.state, outerView.dispatch),
      "Mod-y": () => redo(outerView.state, outerView.dispatch),
    };

    const br = (node.type.schema as Schema).nodes.hard_break;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it is possible for this to be false.
    const enableMultiline = !!br && isMultiline;

    if (enableMultiline) {
      const cmd = chainCommands((state, dispatch) => {
        dispatch?.(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
        return true;
      });
      keymapping["Enter"] = cmd;
    }

    super(
      node,
      outerView,
      getPos,
      offset,
      decorations,
      TextFieldView.fieldName,
      [keymap(keymapping)]
    );

    if (enableMultiline) {
      // We wait to ensure that the browser has applied the appropriate styles.
      setTimeout(() => {
        if (!this.innerEditorView) {
          return;
        }
        const { lineHeight, paddingTop } = window.getComputedStyle(
          this.innerEditorView.dom
        );

        (this.innerEditorView.dom as HTMLDivElement).style.minHeight = `${
          parseInt(lineHeight, 10) * rows + parseInt(paddingTop) * 2
        }px`;
      });
    }
  }
}
