import type { EditorState, Transaction } from "prosemirror-state";

export type CommandCreator = (
  state: EditorState,
  dispatch: (tr: Transaction) => void
) => {
  remove: (run?: boolean) => true | void;
  select: (run?: boolean) => true | void;
  moveUp: (run?: boolean) => boolean | void;
  moveDown: (run?: boolean) => boolean | void;
  moveTop: (run?: boolean) => boolean | void;
  moveBottom: (run?: boolean) => boolean | void;
};

export type Commands = ReturnType<CommandCreator>;
