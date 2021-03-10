import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import {
  Schema,
  DOMParser,
  DOMSerializer,
  NodeSpec,
  Node,
} from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { exampleSetup } from "prosemirror-example-setup";
import { collab } from "prosemirror-collab";

import "prosemirror-view/style/prosemirror.css";
import "prosemirror-menu/style/menu.css";
import "prosemirror-example-setup/style/style.css";
import "prosemirror-example-setup/style/style.css";

import CollabServer from "./collab/CollabServer";
import EditorConnection from "./collab/EditorConnection";
import { createSelectionCollabPlugin } from "./collab/collabHelpers";
import { addEmbedNode, build } from "./embed";
import image from "./embeds/image/embed";
import { addImageNode } from "./embeds/image-native/imageNative";

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const nodes = addImageNode(
  addEmbedNode(schema.spec.nodes as OrderedMap<NodeSpec>)
);

export const mySchema = new Schema({
  nodes,
  marks: schema.spec.marks,
});
const parser = DOMParser.fromSchema(mySchema);
const serializer = DOMSerializer.fromSchema(mySchema);

const docToHtml = (doc: Node) => {
  const dom = serializer.serializeFragment(doc.content);
  const e = document.createElement("div");
  e.appendChild(dom);
  const innerHTML = e.innerHTML;
  return innerHTML;
};

const htmlToDoc = (html: string) => {
  const dom = document.createElement("div");
  dom.innerHTML = html;
  return parser.parse(dom);
};

const get = (name: string) => {
  const state = window.localStorage.getItem(`pm-${name}`);
  return state ? htmlToDoc(state) : mySchema.nodes.doc.createAndFill();
};
const set = (name: string, doc: Node) =>
  window.localStorage.setItem(`pm-${name}`, docToHtml(doc));

const { plugin: embed, insertEmbed, hasErrors } = build({
  image: image({ editSrc: true }),
});

// window.localStorage.setItem('pm', ''); // reset state for debugging

const editorElement = document.querySelector("#editor");

if (!editorElement) {
  throw new Error("No #editor element present in DOM");
}

const highlightErrors = (state: EditorState) => {
  document.body.style.backgroundColor = hasErrors(state)
    ? "red"
    : "transparent";
};

const insertImageEmbed = insertEmbed("image");

import { history } from "prosemirror-history";
import { buildMenuItems } from "prosemirror-example-setup";

const getEditorTemplate = (id: number) => `
  <div id="editor-${id}" class="Editor" spellcheck="false">
    <div id="content-${id}" class="hide">
      <p>
        An example <footnote> document</footnote>, with
        <ul>
          <li>A few</li>
          <li>things</li>
          <li>in it.</li>
        </ul>
      </p>
    </div>
  </div>
`;

const historyPlugin = history();

let menu = buildMenuItems(mySchema);

const appEl = document.getElementById("app-root");
const initialVersion = 0;
const createEditors = (noOfEditors: number, server: CollabServer) =>
  Array(noOfEditors)
    .fill(undefined)
    .map((_, index) => {
      const editorNo = index + 1;

      const clientID = index.toString();
      const collabPlugin = collab({ version: initialVersion, clientID });
      const editorNode = document.createElement("div");
      editorNode.classList.add("Editor__container");
      editorNode.innerHTML = getEditorTemplate(editorNo);
      appEl && appEl.appendChild(editorNode);

      const embedButton = document.createElement("button");
      embedButton.innerHTML = "Embed";
      embedButton.addEventListener("click", () =>
        insertImageEmbed(view.state, view.dispatch)
      );
      editorNode.appendChild(embedButton);

      const contentElement = document.getElementById(`content-${editorNo}`);
      const doc = DOMParser.fromSchema(mySchema).parse(contentElement!);
      if (contentElement && contentElement.parentElement) {
        contentElement.parentElement.removeChild(contentElement);
      }
      const view = new EditorView(
        document.getElementById(`editor-${editorNo}`)!,
        {
          state: EditorState.create({
            doc: get(clientID),
            plugins: [
              ...exampleSetup({
                schema: mySchema,
                history: false,
                menuContent: menu.fullMenu,
              }),
              collabPlugin,
              historyPlugin,
              createSelectionCollabPlugin(clientID),
              embed,
            ],
          }),
        }
      );

      (window as any)[`connection${editorNo}`] = new EditorConnection(
        view,
        server,
        clientID,
        `User ${clientID}`,
        (tr) => {
          highlightErrors(view.state);
          set(clientID, view.state.doc);
        }
      );
      return view;
    });

const server = new CollabServer();
const editors = createEditors(2, server);
const doc = editors[0].state.doc;
server.init(doc);

// Handy debugging tools
(window as any).server = server;
(window as any).editors = editors;
(window as any).ProseMirrorDevTools.applyDevTools(editors[0], { EditorState });
