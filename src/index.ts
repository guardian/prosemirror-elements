import { exampleSetup } from "prosemirror-example-setup";
import type { Node } from "prosemirror-model";
import type { Transaction } from "prosemirror-state";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { build } from "./embed";
import { createImageEmbed } from "./embeds/image/embed";
import { docToHtml, htmlToDoc, mySchema } from "./prosemirrorSetup";

const get = () => {
  const state = window.localStorage.getItem("pm");
  return state
    ? htmlToDoc(state)
    : htmlToDoc(document.getElementById("content")?.innerHTML ?? "");
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
embedButton.id = "embed";
embedButton.addEventListener("click", () =>
  insertEmbed("imageEmbed", { alt: "", caption: "", src: "" })(
    view.state,
    view.dispatch
  )
);
document.body.appendChild(embedButton);

// Handy debugging tools

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any -- debug
(window as any).ProseMirrorDevTools.applyDevTools(view, { EditorState });
((window as unknown) as { view: EditorView }).view = view;
