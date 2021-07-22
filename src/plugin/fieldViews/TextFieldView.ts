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
  isMultiline: boolean;
}

type TextFieldOptions = {
  isMultiline?: boolean;
};

export const createTextField = (
  { isMultiline = false }: TextFieldOptions = { isMultiline: false }
): TextField => ({
  type: TextFieldView.fieldName,
  isMultiline,
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
    // Does this input support multiple lines, separated by line breaks?
    isMultiline: boolean
  ) {
    const keymapping: Record<string, Command> = {
      "Mod-z": () => undo(outerView.state, outerView.dispatch),
      "Mod-y": () => redo(outerView.state, outerView.dispatch),
    };

    const br = (node.type.schema as Schema).nodes.hard_break;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it is possible for this to be false.
    if (br && isMultiline) {
      const cmd = chainCommands((state, dispatch) => {
        dispatch?.(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
        return true;
      });
      keymapping["Mod-Enter"] = cmd;
      keymapping["Shift-Enter"] = cmd;
      keymapping["Ctrl-Enter"] = cmd;
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
  }
}
