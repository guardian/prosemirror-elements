import type { EditorState, Transaction } from "prosemirror-state";

export type CommandCreator = (
  state: EditorState,
  dispatch: (tr: Transaction) => void
) => {
  remove: () => void;
  select: () => void;
  moveUp: () => void;
  moveDown: () => void;
  moveTop: () => void;
  moveBottom: () => void;
};

export type CommandState = {
  moveUp: boolean;
  moveDown: boolean;
};

export type Commands = ReturnType<CommandCreator>;
