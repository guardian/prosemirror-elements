import { EditorState, Transaction } from "prosemirror-state";

export type TCommandCreator = (
  pos: number,
  state: EditorState<any>,
  dispatch: (tr: Transaction<any>) => void
) => {
  remove: (run?: boolean) => boolean;
  moveUp: (run?: boolean) => boolean;
  moveDown: (run?: boolean) => boolean;
  moveTop: (run?: boolean) => boolean;
  moveBottom: (run?: boolean) => boolean;
};

export type TCommands = ReturnType<TCommandCreator>;
