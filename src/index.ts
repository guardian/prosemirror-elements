import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import OrderedMap from 'orderedmap';
import {
  Schema,
  DOMParser,
  DOMSerializer,
  NodeSpec,
  Node
} from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { exampleSetup } from 'prosemirror-example-setup';
import { build } from './embed';
import image from './embeds/image/embed';

const { plugin: embed, insertEmbed, hasErrors, schema: embedSchema } = build({
  image: image({ editSrc: true })
});

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: embedSchema.append(schema.spec.nodes),
  marks: schema.spec.marks
});

const parser = DOMParser.fromSchema(mySchema);
const serializer = DOMSerializer.fromSchema(mySchema);

const docToHtml = (doc: Node) => {
  const dom = serializer.serializeFragment(doc.content);
  const e = document.createElement('div');
  e.appendChild(dom);
  return e.innerHTML;
};

const htmlToDoc = (html: string) => {
  const dom = document.createElement('div');
  dom.innerHTML = html;
  return parser.parse(dom);
};

const get = () => {
  const state = window.localStorage.getItem('pm');
  return state ? htmlToDoc(state) : mySchema.nodes.doc.createAndFill();
};
const set = (doc: Node) => window.localStorage.setItem('pm', docToHtml(doc));


// window.localStorage.setItem('pm', ''); // reset state for debugging

const editorElement = document.querySelector('#editor');

if (!editorElement) {
  throw new Error('No #editor element present in DOM');
}

const highlightErrors = (state: EditorState) => {
  document.body.style.backgroundColor = hasErrors(state)
    ? 'red'
    : 'transparent';
};

const view = new EditorView(editorElement, {
  state: EditorState.create({
    doc: get(),
    plugins: [...exampleSetup({ schema: mySchema }), embed]
  }),
  dispatchTransaction: (tr: Transaction) => {
    const state = view.state.apply(tr);
    view.updateState(state);
    highlightErrors(state);
    set(state.doc);
  }
});

highlightErrors(view.state);

const insertImageEmbed = insertEmbed('image');

const embedButton = document.createElement('button');
embedButton.innerHTML = 'Embed';
embedButton.addEventListener('click', () =>
  insertImageEmbed(view.state, view.dispatch)
);
document.body.appendChild(embedButton);
