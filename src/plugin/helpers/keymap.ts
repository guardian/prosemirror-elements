import { baseKeymap } from "prosemirror-commands";
import { redoNoScroll, undoNoScroll } from "prosemirror-history";
import type { Command, EditorState, Transaction } from "prosemirror-state";
import { TextSelection } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";

const blockedKeys = ["Enter", "Mod-Enter", "Mod-a"];

export const filteredKeymap = Object.fromEntries(
  Object.entries(baseKeymap).filter(([key]) => !blockedKeys.includes(key))
);

/**
 * To prevent the editor from scrolling to the top of an element when undo or
 * redo are called, we dispatch the command without scroll on the outer editor,
 * and then separately call `scrollIntoView` on the inner.
 */
export const createHistoryCommands = (
  outerView: EditorView
): Record<string, Command> => ({
  "Mod-z": (_, __, view) => {
    undoNoScroll(outerView.state, outerView.dispatch);
    return view?.dispatch(view.state.tr.scrollIntoView()) ?? false;
  },
  "Mod-shift-z": (_, __, view) => {
    redoNoScroll(outerView.state, outerView.dispatch);
    return view?.dispatch(view.state.tr.scrollIntoView()) ?? false;
  },
});

/*
  These commands restrict caret traversal to the current text block
  When navigating with the arrow keys the caret should stop at the beginning and end of text blocks
*/
export const preventCaretBoundaryTraversalKeymap: Record<string, Command> = {
  ArrowRight: (state: EditorState) => {
    if (
      state.selection.$from.parentOffset ===
      state.selection.$from.parent.content.size
    ) {
      return true;
    }

    return false;
  },
  ArrowLeft: (state: EditorState) => {
    if (state.selection.$from.parentOffset === 0) {
      return true;
    }

    return false;
  },
  ArrowUp: (
    state: EditorState,
    dispatch?: (tr: Transaction) => void,
    view?: EditorView
  ) => {
    if (view?.endOfTextblock("up", state)) {
      // Move the cursor to the start of this block
      const tr = state.tr.setSelection(
        TextSelection.between(state.doc.resolve(0), state.doc.resolve(0))
      );
      dispatch?.(tr);
      return true;
    }
    return false;
  },
  ArrowDown: (
    state: EditorState,
    dispatch?: (tr: Transaction) => void,
    view?: EditorView
  ) => {
    if (view?.endOfTextblock("down", state)) {
      // Move the cursor to the end of this block
      const tr = state.tr.setSelection(
        TextSelection.between(
          state.doc.resolve(state.doc.content.size),
          state.doc.resolve(state.doc.content.size)
        )
      );
      dispatch?.(tr);
      return true;
    }
    return false;
  },
};
