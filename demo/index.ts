import type OrderedMap from "orderedmap";
import { exampleSetup } from "prosemirror-example-setup";
import type { Node, NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import type { Transaction } from "prosemirror-state";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { createImageElement } from "../src/elements/image/imageElement";
import { buildElementPlugin } from "../src/plugin/element";
import { onCropImage, onSelectImage } from "../src/plugin/helpers";
import {
  createParsers,
  docToHtml,
  htmlToDoc,
} from "../src/plugin/prosemirrorSetup";
import { testDecorationPlugin } from "../src/plugin/testHelpers";

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

const editorElement = document.querySelector("#editor");

if (!editorElement) {
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
    : htmlToDoc(parser, document.getElementById("content")?.innerHTML ?? "");
};

const set = (doc: Node) =>
  window.localStorage.setItem("pm", docToHtml(serializer, doc));

const view = new EditorView(editorElement, {
  state: EditorState.create({
    doc: get(),
    plugins: [...exampleSetup({ schema }), elementPlugin, testDecorationPlugin],
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

// Handy debugging tools

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any -- debug
(window as any).ProseMirrorDevTools.applyDevTools(view, { EditorState });
((window as unknown) as { view: EditorView }).view = view;
((window as unknown) as { docToHtml: () => string }).docToHtml = () =>
  docToHtml(serializer, view.state.doc);
