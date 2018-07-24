import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser, DOMSerializer } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { exampleSetup } from 'prosemirror-example-setup';
import { addEmbedNode, build } from './embed';
import image from './image-embed';

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addEmbedNode(schema.spec.nodes),
  marks: schema.spec.marks
});

const parser = DOMParser.fromSchema(mySchema);
const serializer = DOMSerializer.fromSchema(mySchema);

const docToHtml = doc => {
  const dom = serializer.serializeFragment(doc);
  const e = document.createElement('div');
  e.appendChild(dom);
  return e.innerHTML;
};

const htmlToDoc = html => {
  const dom = document.createElement('div');
  dom.innerHTML = html;
  return parser.parse(dom);
};

const get = () => htmlToDoc(window.localStorage.getItem('pm'));
const set = doc => window.localStorage.setItem('pm', docToHtml(doc));

const { plugin: embed, insertEmbed } = build({
  image: image()
});

// window.localStorage.setItem('pm', '');

const view = new EditorView(document.querySelector('#editor'), {
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
