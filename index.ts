import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import * as OrderedMap from 'orderedmap';
import { Schema, DOMParser, DOMSerializer, Fragment, NodeSpec } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { exampleSetup } from 'prosemirror-example-setup';
import { addEmbedNode, build } from './embed';
import image from './embeds/image/plugin';

schema.spec.nodes

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addEmbedNode(schema.spec.nodes as OrderedMap<NodeSpec>),
  marks: schema.spec.marks
});

const parser = DOMParser.fromSchema(mySchema);
const serializer = DOMSerializer.fromSchema(mySchema);

const docToHtml = (doc: Fragment<Schema<any, "code" | "em" | "link" | "strong">>) => {
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
const set = (doc: Fragment<Schema<any, "code" | "em" | "link" | "strong">>) => window.localStorage.setItem('pm', docToHtml(doc));

const { plugin: embed, insertEmbed } = build({
  image: image()
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
  dispatchTransaction: tr => {
    const state = view.state.apply(tr);
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
