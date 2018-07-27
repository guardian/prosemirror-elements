import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import {
  Schema,
  DOMParser,
  DOMSerializer,
  NodeSpec,
  Node
} from 'prosemirror-model';
import { schema as schemaBasic } from 'prosemirror-schema-basic';
import { exampleSetup } from 'prosemirror-example-setup';
import { addEmbedNode, build } from '../src/embed';
import image from '../src/embeds/image/embed';

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const schema = new Schema({
  nodes: addEmbedNode(schemaBasic.spec.nodes as OrderedMap<NodeSpec>),
  marks: schemaBasic.spec.marks
});

const parser = DOMParser.fromSchema(schema);
const serializer = DOMSerializer.fromSchema(schema);

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
  return state ? htmlToDoc(state) : schema.nodes.doc.createAndFill();
};
const set = (doc: Node) => window.localStorage.setItem('pm', docToHtml(doc));

const { plugin: embed, insertEmbed, hasErrors } = build({
  image: image({ editSrc: true })
});

// window.localStorage.setItem('pm', '');

const editorElement = document.querySelector('#editor');

if (!editorElement) {
  throw new Error('No #editor element present in DOM');
}

const view = new EditorView(editorElement, {
  state: EditorState.create({
    doc: get(),
    plugins: [...exampleSetup({ schema }), embed]
  }),
  dispatchTransaction: (tr: Transaction) => {
    const state = view.state.apply(tr);
    state.doc;
    view.updateState(state);
    document.body.style.backgroundColor = hasErrors(state)
      ? 'red'
      : 'transparent';
    set(state.doc);
  }
});

const insertImageEmbed = insertEmbed('image');

const embedButton = document.createElement('button');
embedButton.innerHTML = 'Embed';
embedButton.addEventListener('click', () =>
  insertImageEmbed(view.state, view.dispatch)
);
document.body.appendChild(embedButton);
