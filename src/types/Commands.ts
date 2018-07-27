import { EditorState, Transaction } from 'prosemirror-state';

export type TCommandCreator = (pos: number, state: EditorState<any>, dispatch: (tr: Transaction<any>) => void) => {
    remove: (run?: boolean) => true | undefined;
    moveUp: (run?: boolean) => boolean | undefined;
    moveDown: (run?: boolean) => boolean | undefined;
    moveTop: (run?: boolean) => boolean | undefined;
    moveBottom: (run?: boolean) => boolean | undefined;
}

export type TCommands = ReturnType<TCommandCreator>
