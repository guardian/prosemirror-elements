import { EditorState, Transaction } from "prosemirror-state";
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
import { addEmbedNode, build } from "./embed";
import image from "./embeds/image/embed";
import { addImageNode, ImageNodeView } from "./embeds/image-native/imageNative";

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

// const view = new EditorView(editorElement, {
//   state: EditorState.create({
//     doc: get(),
//     plugins: [...exampleSetup({ schema: mySchema }), embed]
//   }),
//   dispatchTransaction: (tr: Transaction) => {
//     const state = view.state.apply(tr);
//     view.updateState(state);

//     console.log(tr)
//     highlightErrors(state);
//     console.log(state.doc)
//     set(state.doc);
//   }
// });

const insertImageEmbed = insertEmbed("image");

import { Selection } from "prosemirror-state";
import { Step } from "prosemirror-transform";
import { history } from "prosemirror-history";
import { buildMenuItems } from "prosemirror-example-setup";

import "prosemirror-view/style/prosemirror.css";
import "prosemirror-menu/style/menu.css";
import "prosemirror-example-setup/style/style.css";
import "prosemirror-example-setup/style/style.css";
import {
  collab,
  receiveTransaction,
  sendableSteps,
  getVersion,
} from "prosemirror-collab";
import {
  COLLAB_ACTION,
  createSelectionCollabPlugin,
  actionSelectionsChanged,
  getSelectionVersion,
} from "./collabHelpers";

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

const initialVersion = 0;

type StepsPayload = NonNullable<ReturnType<typeof sendableSteps>>;
type LocalStep = { step: Step; clientID: string };
type SelectionMap = Map<
  string,
  { selection: Selection | undefined; userName: string; version: number }
>;
class CollabServer {
  private version: number = 0;
  private steps: LocalStep[] = [];
  private doc: Node | undefined;
  private selections: SelectionMap = new Map();

  public init(doc: Node) {
    this.doc = doc;
  }

  public addSteps({ version, steps, clientID }: StepsPayload) {
    if (this.version !== version) return false;
    for (let i = 0; i < steps.length; i++) {
      this.doc = steps[i].apply(this.doc!).doc!;
    }
    this.version += steps.length;
    this.steps = this.steps.concat(
      steps.map((step) => ({ step, clientID: clientID.toString() }))
    );
  }

  public addSelection(
    selection: Selection,
    clientID: string,
    userName: string,
    version: number
  ) {
    this.selections.set(clientID, { userName, selection, version });
  }

  public getState(
    version: number
  ): { steps: LocalStep[]; selections: SelectionMap } | false {
    let startIndex = this.steps.length - (this.version - version);
    if (startIndex < 0) {
      return false;
    }

    return {
      steps: this.steps.slice(startIndex),
      selections: this.selections,
    };
  }
}

class EditorConnection {
  private state: EditorState;
  private lastSentSelection: Selection | undefined = undefined;

  constructor(
    private view: EditorView,
    private server: CollabServer,
    private clientID: string,
    private userName: string
  ) {
    this.state = view.state;
    view.setProps({
      dispatchTransaction: (tr) => this.dispatchTransaction(tr),
    });
    this.startPolling();
  }

  private dispatchTransaction = (transaction: Transaction) => {
    this.state = this.state.apply(transaction);
    const steps = sendableSteps(this.state);
    if (steps) {
      this.addStepsFromEditor(steps);
    }
    if (this.state.selection !== this.lastSentSelection) {
      this.addSelection(this.state.selection);
    }
    this.view.updateState(this.state);

    highlightErrors(this.state);
    set(this.clientID, this.state.doc);
  };

  private addStepsFromEditor(steps: StepsPayload) {
    console.log({ steps });
    this.server.addSteps(steps);
  }

  private addSelection(selection: Selection) {
    this.lastSentSelection = this.state.selection;
    const version = getSelectionVersion(this.state);
    this.server.addSelection(selection, this.clientID, this.userName, version);
  }

  public startPolling() {
    setInterval(() => {
      const version = getVersion(this.state);
      const state = server.getState(version);
      if (!state) {
        return console.log("Could not get steps on last poll");
      }
      const { steps, selections } = state;
      const tr = receiveTransaction(
        this.state,
        steps.map((s) => s.step),
        steps.map((s) => s.clientID)
      );
      const selectionSpecs = [...Array.from(selections.entries())].map(
        ([clientID, { userName, selection, version }]) => ({
          clientID,
          userName,
          selection,
          version,
        })
      );
      tr.setMeta(COLLAB_ACTION, actionSelectionsChanged(selectionSpecs));
      console.log({ tr, selectionSpecs });
      this.dispatchTransaction(tr);
    }, 5000);
  }
}

let menu = buildMenuItems(mySchema);

const appEl = document.getElementById("app-root");
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
        `User ${clientID}`
      );
      return view;
    });

const server = new CollabServer();
const editors = createEditors(4, server);
const doc = editors[0].state.doc;
server.init(doc);

// Handy debugging tools
(window as any).server = server;
(window as any).editors = editors;
(window as any).ProseMirrorDevTools.applyDevTools(editors[0], { EditorState });
