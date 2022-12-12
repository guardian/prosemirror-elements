import { baseKeymap, newlineInCode } from "prosemirror-commands";
import { redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import type { AttributeSpec, Node } from "prosemirror-model";
import type { Command, EditorState, Transaction } from "prosemirror-state";
import type { DecorationSource, EditorView } from "prosemirror-view";
import type { FieldValidator } from "../elementSpec";
import { filteredKeymap } from "../helpers/keymap";
import type { PlaceholderOption } from "../helpers/placeholder";
import { selectAllText } from "../helpers/prosemirror";
import { waitForNextLayout } from "../helpers/util";
import type { AbstractTextFieldDescription } from "./ProseMirrorFieldView";
import { ProseMirrorFieldView } from "./ProseMirrorFieldView";

export interface TextFieldDescription extends AbstractTextFieldDescription {
  type: typeof TextFieldView.fieldType;
  // Can this field display over multiple lines? This will
  // insert line breaks (<br>) when the user hits the Enter key.
  isMultiline: boolean;
  // The maximum number of rows this input should occupy
  maxRows?: number;
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
  isMultiline?: boolean;
  maxRows?: number | undefined;
  absentOnEmpty?: boolean;
  validators?: FieldValidator[];
  placeholder?: PlaceholderOption;
  attrs?: Record<string, AttributeSpec>;
  isResizeable?: boolean;
};

export const createTextField = (
  {
    rows = 1,
    isCode = false,
    absentOnEmpty = false,
    isResizeable = false,
    validators,
    placeholder,
    attrs,
    maxRows,
  }: TextFieldOptions | undefined = {
    rows: 1,
    isCode: false,
    isResizeable: false,
    absentOnEmpty: false,
    validators: [],
    placeholder: undefined,
    maxRows: undefined,
  }
): TextFieldDescription => ({
  type: TextFieldView.fieldType,
  isMultiline: rows > 1,
  isResizeable,
  maxRows,
  rows,
  isCode,
  absentOnEmpty,
  validators,
  placeholder,
  attrs,
});

export class TextFieldView extends ProseMirrorFieldView {
  public static fieldType = "text" as const;

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
    decorations: DecorationSource,
    {
      isMultiline,
      maxRows,
      rows,
      isCode,
      placeholder,
      isResizeable,
    }: TextFieldDescription
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- remove 'enter' commands from keymap
    const { Enter, "Mod-Enter": ModEnter, ...modifiedBaseKeymap } = baseKeymap;
    const keymapping: Record<string, Command> = {
      ...modifiedBaseKeymap,
      "Mod-z": () => undo(outerView.state, outerView.dispatch),
      "Mod-y": () => redo(outerView.state, outerView.dispatch),
      ...filteredKeymap,
    };

    const br = node.type.schema.nodes.hard_break;
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

    keymapping["Mod-a"] = selectAllText;

    super(
      node,
      outerView,
      getPos,
      offset,
      decorations,
      [keymap(keymapping)],
      placeholder,
      isResizeable
    );

    if (isCode && this.innerEditorView) {
      const dom = this.innerEditorView.dom as HTMLDivElement;
      dom.style.fontFamily = "monospace";
      dom.style.whiteSpace = "pre-wrap";
    }

    if (enableMultiline || maxRows) {
      // We wait to ensure that the browser has applied the appropriate styles.
      void waitForNextLayout().then(() => {
        if (!this.innerEditorView) {
          return;
        }

        const { lineHeight, paddingTop } = window.getComputedStyle(
          this.innerEditorView.dom
        );

        const domElement = this.innerEditorView.dom as HTMLDivElement;
        if (enableMultiline) {
          const initialInputHeightPx = `${
            parseInt(lineHeight, 10) * rows + parseInt(paddingTop) * 2
          }px`;
          domElement.style.minHeight = initialInputHeightPx;
          if (isResizeable) {
            // If the input is resizeable, assume that the user would like the input
            // to begin life with its height set to `rows`, with the opportunity to
            // expand it later.
            domElement.style.height = initialInputHeightPx;
          }
        }

        if (maxRows) {
          const maxHeightPx = `${
            parseInt(lineHeight, 10) * maxRows + parseInt(paddingTop)
          }px`;
          domElement.style.maxHeight = maxHeightPx;
          domElement.style.overflowY = "scroll";
        }
      });
    }

    this.fieldViewElement.classList.add("ProseMirrorElements__TextField");
  }
}
