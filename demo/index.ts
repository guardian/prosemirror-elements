import { FocusStyleManager } from "@guardian/src-foundations/utils";
import type OrderedMap from "orderedmap";
import { collab } from "prosemirror-collab";
import { exampleSetup } from "prosemirror-example-setup";
import type { Node, NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
<<<<<<< HEAD
import { createImageElement } from "../src/elements/demo-image/DemoImageElement";
import { createEmbedElement } from "../src/elements/embed/EmbedSpec";
=======
>>>>>>> 29db66b... removes commented imports
import { createPullquoteElement } from "../src/elements/pullquote/PullquoteSpec";
import { buildElementPlugin } from "../src/plugin/element";
import {
  createParsers,
  docToHtml,
  htmlToDoc,
} from "../src/plugin/helpers/prosemirror";
import { testDecorationPlugin } from "../src/plugin/helpers/test";
import { CollabServer, EditorConnection } from "./collab/CollabServer";
import { createSelectionCollabPlugin } from "./collab/SelectionPlugin";

// Only show focus when the user is keyboard navigating, not when
// they click a text field.
FocusStyleManager.onlyShowFocusOnTabs();
const embedElementName = "embedElement";
const imageElementName = "imageElement";

type Name = typeof embedElementName | typeof imageElementName;

const {
  plugin: elementPlugin,
  insertElement,
  hasErrors,
  nodeSpec,
<<<<<<< HEAD
} = buildElementPlugin({
  imageElement: createImageElement(onSelectImage, onCropImage),
  embedElement: createEmbedElement(),
  pullquoteElement: createPullquoteElement(),
});
=======
} = buildElementPlugin([createPullquoteElement("pullquoteElement")]);
>>>>>>> 29db66b... removes commented imports

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

let editorNo = 0;
// We use this as a source of truth when instantiating new editors.
let firstCollabPlugin: ReturnType<typeof collab> | undefined;
let firstEditor: EditorView | undefined;

const createEditor = (server: CollabServer) => {
  // Add the editor nodes to the DOM
  const isFirstEditor = !firstEditor;
  const editorElement = document.createElement("div");
  editorElement.id = `editor-${editorNo}`;
  editorElement.classList.add("Editor");
  editorsContainer.appendChild(editorElement);

  const contentElement = document.getElementById(`content-${editorNo}`);
  if (contentElement?.parentElement) {
    contentElement.parentElement.removeChild(contentElement);
  }

  // Create the editor
  const clientID = editorNo.toString();
  const currentVersion =
    firstEditor && firstCollabPlugin
      ? (firstCollabPlugin.getState(firstEditor.state) as number)
      : 0;
  const collabPlugin = collab({ version: currentVersion, clientID });
  const view = new EditorView(editorElement, {
    state: EditorState.create({
      doc: isFirstEditor ? get() : firstEditor?.state.doc,
      plugins: [
        ...exampleSetup({ schema }),
        elementPlugin,
        testDecorationPlugin,
        collabPlugin,
        createSelectionCollabPlugin(clientID),
      ],
    }),
  });

  if (!isFirstEditor) {
    firstEditor = view;
  }

  highlightErrors(view.state);

  const createElementButton = (
    buttonText: string,
    elementId: Name,
    elementArgs: Record<string, unknown>
  ) => {
    const elementButton = document.createElement("button");
    elementButton.innerHTML = buttonText;
    elementButton.id = elementId;
    elementButton.addEventListener("click", () =>
      insertElement(elementId, elementArgs)(view.state, view.dispatch)
    );
    return elementButton;
  };

  editorElement.appendChild(
    createElementButton("Add embed element", embedElementName, {
      weighting: "",
      sourceUrl: "",
      embedCode: "",
      caption: "",
      altText: "",
      required: false,
    })
  );

  editorElement.appendChild(
    createElementButton("Add image element", imageElementName, {
      altText: "",
      caption: "",
      useSrc: { value: false },
    })
  );
  editorElement.appendChild(
    createElementButton("Add pullquote element", imageElementName, {
      pullquote: "",
      attribution: "",
      weighting: "supporting",
    })
  );

  new EditorConnection(view, server, clientID, `User ${clientID}`, (state) => {
    highlightErrors(state);
    if (isFirstEditor) {
      set(state.doc);
    }
  });

  editorNo++;

  return view;
};

const server = new CollabServer();
firstEditor = createEditor(server);
const doc = firstEditor.state.doc;
server.init(doc);

// Add more editors
const addEditorButton = document.createElement("button");
addEditorButton.innerHTML = "Add another editor";
addEditorButton.id = "add-editor";
addEditorButton.addEventListener("click", () => createEditor(server));
document.body.appendChild(addEditorButton);

// Handy debugging tools

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any -- debug
(window as any).ProseMirrorDevTools.applyDevTools(firstEditor, {
  EditorState,
});
((window as unknown) as { view: EditorView }).view = firstEditor;
((window as unknown) as { docToHtml: () => string }).docToHtml = () =>
  firstEditor ? docToHtml(serializer, firstEditor.state.doc) : "";
