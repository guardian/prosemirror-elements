import type { EditorState } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import type { insertElement } from "./";

type State = { EditorState: typeof EditorState };

export type WindowType = {
  ProseMirrorDevTools: {
    applyDevTools: (editor: EditorView, state: State) => void;
  };
  PM_ELEMENTS: {
    view: EditorView;
    insertElement: typeof insertElement;
    docToHtml: () => string;
    htmlToDoc: (html: string) => void;
  };
};
