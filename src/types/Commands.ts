import { EditorState, Transaction } from 'prosemirror-state';

export type TCommandCreator = (pos: number, state: EditorState<any>, dispatch: (tr: Transaction<any>) => void) => {
    remove: (run?: boolean) => true | void;
    moveUp: (run?: boolean) => boolean | void;
    moveDown: (run?: boolean) => boolean | void;
    moveTop: (run?: boolean) => boolean | void;
    moveBottom: (run?: boolean) => boolean | void;
}

export type TCommands = ReturnType<TCommandCreator>
