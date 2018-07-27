import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { Schema, NodeSpec } from 'prosemirror-model';
import { doc, p } from 'prosemirror-test-builder';
import { schema as schemaBasic } from 'prosemirror-schema-basic';
import { addEmbedNode, build } from '../src/embed';
import { exampleSetup } from 'prosemirror-example-setup';
import mount from '../src/mount';

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const schema = new Schema({
  nodes: addEmbedNode(schemaBasic.spec.nodes as OrderedMap<NodeSpec>),
  marks: schemaBasic.spec.marks
});

let rendered = null;

const render = (el: any) => { rendered = el };

const test = mount<{}>(
  (consume, dom, updateFields, fields, commands, onStateUpdate) => {
    console.log('render');
    const el = consume(fields, updateFields);
    render(el);
  }
)(
  (fields, errors, updateupdateFieldsState) => {
    console.log('consume');
    return {};
  },
  () => null,
  { test: 'hai' }
); // (dom, updateState, fields, commands);

// TODO: test with prosemirror-history

const getViewAndCommands = () => {
  const dom = document.createElement('div');
  const { plugin: embed, insertEmbed } = build({
    test
  });
  const view = new EditorView(dom, {
    state: EditorState.create({
      schema,
      plugins: [...exampleSetup({ schema }), embed]
    })
  });

  return { view, insertEmbed };
};

describe('embed', () => {
  it('should run tests', () => {
    const { view, insertEmbed } = getViewAndCommands();
    insertEmbed('test')(view.state, view.dispatch);
  });
});
