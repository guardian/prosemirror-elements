import type OrderedMap from "orderedmap";
import { collab } from "prosemirror-collab";
import { exampleSetup } from "prosemirror-example-setup";
import type { Node, NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import type { Transaction } from "prosemirror-state";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { createImageElement } from "../src/elements/image/imageElement";
import { buildElementPlugin } from "../src/plugin/element";
import {
  createParsers,
  docToHtml,
  htmlToDoc,
} from "../src/plugin/helpers/prosemirror";
import { testDecorationPlugin } from "../src/plugin/helpers/test";
import { CollabServer, EditorConnection } from "./collab/CollabServer";
import { createSelectionCollabPlugin } from "./collab/SelectionPlugin";
import { onCropImage, onSelectImage } from "./helpers";

const {
  plugin: elementPlugin,
  insertElement,
  hasErrors,
  nodeSpec,
} = buildElementPlugin([
  createImageElement("imageElement", onSelectImage, onCropImage),
]);

const schema = new Schema({
  nodes: (basicSchema.spec.nodes as OrderedMap<NodeSpec>).append(nodeSpec),
  marks: basicSchema.spec.marks,
});

const { serializer, parser } = createParsers(schema);

const editorsContainer = document.querySelector("#editor-container");

if (!editorsContainer) {
  throw new Error("No #editor element present in DOM");
}

const highlightErrors = (state: EditorState) => {
  document.body.style.backgroundColor = hasErrors(state)
    ? "red"
    : "transparent";
};

const get = () => {
  const state = window.localStorage.getItem("pm");
  return state
    ? htmlToDoc(parser, state)
    : htmlToDoc(
        parser,
        document.getElementById("content-template")?.innerHTML ?? ""
      );
};

const set = (doc: Node) =>
  window.localStorage.setItem("pm", docToHtml(serializer, doc));

const initialVersion = 0;

const createEditors = (noOfEditors: number, server: CollabServer) =>
  Array(noOfEditors)
    .fill(undefined)
    .map((_, index) => {
      const editorNo = index + 1;

      // Add the editor nodes to the DOM
      const editorElement = document.createElement("div");
      editorElement.id = `editor-${editorNo}`;
      editorElement.classList.add("Editor");
      editorsContainer.appendChild(editorElement);

      const contentElement = document.getElementById(`content-${editorNo}`);
      if (contentElement?.parentElement) {
        contentElement.parentElement.removeChild(contentElement);
      }

      // Create the editor
      const clientID = index.toString();
      const collabPlugin = collab({ version: initialVersion, clientID });

      const view = new EditorView(editorElement, {
        state: EditorState.create({
          doc: get(),
          plugins: [
            ...exampleSetup({ schema }),
            elementPlugin,
            testDecorationPlugin,
            collabPlugin,
            createSelectionCollabPlugin(clientID),
          ],
        }),
        dispatchTransaction: (tr: Transaction) => {
          const state = view.state.apply(tr);
          view.updateState(state);
          highlightErrors(state);
          set(state.doc);
        },
      });

      highlightErrors(view.state);

      const elementButton = document.createElement("button");
      elementButton.innerHTML = "Element";
      elementButton.id = "element";
      elementButton.addEventListener("click", () =>
        insertElement("imageElement", {
          altText: "",
          caption: "",
          useSrc: { value: false },
        })(view.state, view.dispatch)
      );
      document.body.appendChild(elementButton);

      new EditorConnection(view, server, clientID, `User ${clientID}`);

      return view;
    });

const server = new CollabServer();
const editors = createEditors(2, server);
const debugView = editors[0];
const doc = debugView.state.doc;
server.init(doc);

// Handy debugging tools

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any -- debug
(window as any).ProseMirrorDevTools.applyDevTools(debugView, { EditorState });
((window as unknown) as { view: EditorView }).view = debugView;
((window as unknown) as { docToHtml: () => string }).docToHtml = () =>
  docToHtml(serializer, debugView.state.doc);
