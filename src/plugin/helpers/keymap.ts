import { baseKeymap } from "prosemirror-commands";
import { redoNoScroll, undoNoScroll } from "prosemirror-history";
import type { Command } from "prosemirror-state";
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
  "Mod-y": (_, __, view) => {
    redoNoScroll(outerView.state, outerView.dispatch);
    return view?.dispatch(view.state.tr.scrollIntoView()) ?? false;
  },
});
