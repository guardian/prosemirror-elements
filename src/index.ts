import type OrderedMap from "orderedmap";
import { exampleSetup } from "prosemirror-example-setup";
import type { Node, NodeSpec } from "prosemirror-model";
import { DOMParser, DOMSerializer, Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import type { Plugin, Transaction } from "prosemirror-state";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { addEmbedNode, build } from "./embed";
import { createImageEmbed } from "./embeds/image/embed";

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addEmbedNode(schema.spec.nodes as OrderedMap<NodeSpec>),
  marks: schema.spec.marks,
});

const parser = DOMParser.fromSchema(mySchema);
const serializer = DOMSerializer.fromSchema(mySchema);

const docToHtml = (doc: Node) => {
  const dom = serializer.serializeFragment(doc.content);
  const e = document.createElement("div");
  e.appendChild(dom);
  return e.innerHTML;
};

const htmlToDoc = (html: string) => {
  const dom = document.createElement("div");
  dom.innerHTML = html;
  return parser.parse(dom);
};

const get = () => {
  const state = window.localStorage.getItem("pm");
  return state ? htmlToDoc(state) : mySchema.nodes.doc.createAndFill();
};
const set = (doc: Node) => window.localStorage.setItem("pm", docToHtml(doc));

const { plugin: embedPlugin, insertEmbed, hasErrors } = build({
  imageEmbed: createImageEmbed({ editSrc: true }),
});

const editorElement = document.querySelector("#editor");

if (!editorElement) {
  throw new Error("No #editor element present in DOM");
}

const highlightErrors = (state: EditorState) => {
  document.body.style.backgroundColor = hasErrors(state)
    ? "red"
    : "transparent";
};

const view = new EditorView(editorElement, {
  state: EditorState.create({
    doc: get(),
    plugins: [...exampleSetup({ schema: mySchema }), embedPlugin],
  }),
  dispatchTransaction: (tr: Transaction) => {
    const state = view.state.apply(tr);
    view.updateState(state);
    highlightErrors(state);
    set(state.doc);
  },
});

highlightErrors(view.state);

const embedButton = document.createElement("button");
embedButton.innerHTML = "Embed";
embedButton.addEventListener("click", () =>
  insertEmbed("imageEmbed", { alt: "", caption: "", src: "" })(
    view.state,
    view.dispatch
  )
);
document.body.appendChild(embedButton);

// Handy debugging tools

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- debug
(window as any).ProseMirrorDevTools.applyDevTools(view, { EditorState });
