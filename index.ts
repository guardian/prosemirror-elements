import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser, DOMSerializer, Fragment, NodeSpec, Node } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { exampleSetup } from 'prosemirror-example-setup';
import { addEmbedNode, build } from './embed';
import image from './embeds/image/plugin';
// For the use of 'require' here, see https://stackoverflow.com/questions/39415661/what-does-resolves-to-a-non-module-entity-and-cannot-be-imported-using-this
import OrderedMap = require('orderedmap'); 

schema.spec.nodes

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addEmbedNode(schema.spec.nodes as OrderedMap<NodeSpec>),
  marks: schema.spec.marks
});

const parser = DOMParser.fromSchema(mySchema);
const serializer = DOMSerializer.fromSchema(mySchema);

const docToHtml = (doc: Node) => {
  const dom = serializer.serializeFragment(doc);
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
  return state ? htmlToDoc(state) : null;
}
const set = (doc: Node) => window.localStorage.setItem('pm', docToHtml(doc));

const { plugin: embed, insertEmbed } = build({
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
    plugins: [
      ...exampleSetup({ schema: mySchema }),
      embed
    ]
  }),
  dispatchTransaction: (tr: Transaction) => {
    const state = view.state.apply(tr);
    state.doc
    view.updateState(state);
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
