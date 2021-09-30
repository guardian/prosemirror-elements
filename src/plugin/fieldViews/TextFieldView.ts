import type { Command } from "prosemirror-commands";
import { baseKeymap, newlineInCode } from "prosemirror-commands";
import { redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import type { Node, NodeSpec, Schema } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import type { FieldValidator } from "../elementSpec";
import type { PlaceholderOption } from "../helpers/placeholder";
import type { AbstractTextFieldDescription } from "./ProseMirrorFieldView";
import { ProseMirrorFieldView } from "./ProseMirrorFieldView";

export interface TextFieldDescription extends AbstractTextFieldDescription {
  type: typeof TextFieldView.fieldName;
  // Can this field display over multiple lines? This will
  // insert line breaks (<br>) when the user hits the Enter key.
  isMultiline: boolean;
  // The minimum number of rows this input should occupy.
  // Analogous to the <textarea> `rows` attribute.
  rows: number;
  // The text field is used to display code
  isCode: boolean;
  // If the text field is empty (""), don't include its key in the output data
  // created by `getElementDataFromNode`.
  absentOnEmpty?: boolean;
}

type TextFieldOptions = {
  rows?: number;
  isCode?: boolean;
  absentOnEmpty?: boolean;
  validators?: FieldValidator[];
  placeholder?: PlaceholderOption;
  nodeSpec?: Partial<NodeSpec>;
};

export const createTextField = (
  {
    rows = 1,
    isCode = false,
    absentOnEmpty = false,
    validators,
    placeholder,
    nodeSpec,
  }: TextFieldOptions | undefined = {
    rows: 1,
    isCode: false,
    absentOnEmpty: false,
    validators: [],
    placeholder: undefined,
  }
): TextFieldDescription => ({
  type: TextFieldView.fieldName,
  isMultiline: rows > 1,
  rows,
  isCode,
  absentOnEmpty,
  validators,
  placeholder,
  nodeSpec,
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
    { isMultiline, rows, isCode, placeholder }: TextFieldDescription
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- remove 'enter' commands from keymap
    const { Enter, "Mod-Enter": ModEnter, ...modifiedBaseKeymap } = baseKeymap;
    const keymapping: Record<string, Command> = {
      ...modifiedBaseKeymap,
      "Mod-z": () => undo(outerView.state, outerView.dispatch),
      "Mod-y": () => redo(outerView.state, outerView.dispatch),
    };

    const br = (node.type.schema as Schema).nodes.hard_break;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it is possible for this to be false.
    const enableMultiline = !!br && isMultiline;

    if (enableMultiline) {
      const newLineCommand = isCode
        ? newlineInCode
        : (state: EditorState, dispatch?: (tr: Transaction) => void) => {
            dispatch?.(
              state.tr.replaceSelectionWith(br.create()).scrollIntoView()
            );
            return true;
          };
      keymapping["Enter"] = newLineCommand;
    }

    super(
      node,
      outerView,
      getPos,
      offset,
      decorations,
      TextFieldView.fieldName,
      [keymap(keymapping)],
      placeholder
    );

    if (isCode && this.innerEditorView) {
      const dom = this.innerEditorView.dom as HTMLDivElement;
      dom.style.fontFamily = "monospace";
      dom.style.whiteSpace = "pre";
    }

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

    this.fieldViewElement.classList.add("ProseMirrorElements__TextField");
  }
}
