import type { NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { TextSelection } from "prosemirror-state";
import { StepMap } from "prosemirror-transform";
import { DecorationSet } from "prosemirror-view";
import { createEditorWithElements } from "../../helpers/test";
import { getNodeNameFromField, getNodeSpecForField } from "../../nodeSpec";
import type { TextFieldDescription } from "../TextFieldView";
import { TextFieldView } from "../TextFieldView";

class TestProseMirrorFieldView extends TextFieldView {
  getInnerEditorView = () => {
    return this.innerEditorView;
  };
}

const testSchema = new Schema({
  nodes: {
    doc: schema.nodes.doc,
    text: schema.nodes.text,
    ...(getNodeSpecForField("doc", "testField", {
      type: "text",
      defaultValue: "",
      isMultiline: false,
      rows: 4,
      isCode: false,
    }) as { testField: NodeSpec }),
  },
});

const textFieldDescription: TextFieldDescription = {
  type: "text",
  isMultiline: false,
  rows: 4,
  isCode: false,
};

describe("the TextFieldView, as an extension of the ProseMirrorFieldView", () => {
  it("should update its internal selection when a new selection is passed in, encompassed within its range", () => {
    const { view } = createEditorWithElements([]);
    const nodeName = getNodeNameFromField("testField", "doc");
    const node = testSchema.nodes[nodeName].create(
      {
        type: "text",
      },
      testSchema.text("some text")
    );
    const decorations = DecorationSet.create(view.state.doc, []);
    const fieldView = new TestProseMirrorFieldView(
      node,
      view,
      () => 0,
      0,
      decorations,
      textFieldDescription
    );
    const offset = fieldView.offset;
    const textFieldViewInnerEditor = fieldView.getInnerEditorView();
    if (!textFieldViewInnerEditor)
      throw new Error("Text field editor was undefined");

    const initialSelection = textFieldViewInnerEditor.state.selection;
    // Offset the initial selection so that it is within the inner editor's field
    const offsetMap = StepMap.offset(3);
    const mappedSelection = initialSelection.map(
      textFieldViewInnerEditor.state.tr.doc,
      offsetMap
    );
    fieldView.onUpdate(node, offset, decorations, mappedSelection);
    const updatedSelection = fieldView.getInnerEditorView()?.state.selection;

    expect(initialSelection.from).toBe(0);
    expect(initialSelection.to).toBe(0);
    // Selection is positioned at '1' relative to the outer editor, rather than 3, because
    // the inner editor is offset by 2
    expect(updatedSelection?.from).toBe(1);
    expect(updatedSelection?.to).toBe(1);
  });

  it("should not update its internal selection when a selection is passed in outside of its range", () => {
    const { view } = createEditorWithElements(
      [],
      "Some arbitrary text content"
    );
    const nodeName = getNodeNameFromField("testField", "doc");
    const node = testSchema.nodes[nodeName].create(
      {
        type: "text",
      },
      testSchema.text("some text")
    );
    const decorations = DecorationSet.create(view.state.doc, []);
    const fieldView = new TestProseMirrorFieldView(
      node,
      view,
      () => 0,
      0,
      decorations,
      textFieldDescription
    );
    const offset = fieldView.offset;
    const textFieldViewInnerEditor = fieldView.getInnerEditorView();
    if (!textFieldViewInnerEditor)
      throw new Error("Text field editor was undefined");

    const initialSelection = textFieldViewInnerEditor.state.selection;
    // A selection that will be outside the innerEditor's range
    const newSelection = TextSelection.create(view.state.doc, 15, 15);
    fieldView.onUpdate(node, offset, decorations, newSelection);
    const updatedSelection = fieldView.getInnerEditorView()?.state.selection;

    expect(initialSelection.from).toBe(0);
    expect(initialSelection.to).toBe(0);
    expect(updatedSelection?.from).toBe(0);
    expect(updatedSelection?.to).toBe(0);
  });

  it(`should update its internal doc when a node with different content is passed in, 
      with different content starting at the first position of the inner editor`, () => {
    const { view } = createEditorWithElements(
      [],
      "Some arbitrary text content"
    );
    const nodeName = getNodeNameFromField("testField", "doc");
    const node = testSchema.nodes[nodeName].create(
      {
        type: "text",
      },
      testSchema.text("bcdef")
    );
    const decorations = DecorationSet.create(view.state.doc, []);
    const fieldView = new TestProseMirrorFieldView(
      node,
      view,
      () => 0,
      0,
      decorations,
      textFieldDescription
    );
    const offset = fieldView.offset;
    const textFieldViewInnerEditor = fieldView.getInnerEditorView();
    if (!textFieldViewInnerEditor)
      throw new Error("Text field editor was undefined");

    const newNode = testSchema.nodes[nodeName].create(
      {
        type: "text",
      },
      testSchema.text("abcdef")
    );
    fieldView.onUpdate(newNode, offset, decorations);
    const updatedNode = fieldView.getInnerEditorView()?.state.doc;

    expect(updatedNode?.textContent).toBe("abcdef");
  });

  it(`should update its internal doc when a node with different content is passed in, 
      with different content only in the final position of the inner editor`, () => {
    const { view } = createEditorWithElements(
      [],
      "Some arbitrary text content"
    );
    const nodeName = getNodeNameFromField("testField", "doc");
    const node = testSchema.nodes[nodeName].create(
      {
        type: "text",
      },
      testSchema.text("abcdd")
    );
    const decorations = DecorationSet.create(view.state.doc, []);
    const fieldView = new TestProseMirrorFieldView(
      node,
      view,
      () => 0,
      0,
      decorations,
      textFieldDescription
    );
    const offset = fieldView.offset;
    const textFieldViewInnerEditor = fieldView.getInnerEditorView();
    if (!textFieldViewInnerEditor)
      throw new Error("Text field editor was undefined");

    const newNode = testSchema.nodes[nodeName].create(
      {
        type: "text",
      },
      testSchema.text("abcde")
    );
    fieldView.onUpdate(newNode, offset, decorations);
    const updatedNode = fieldView.getInnerEditorView()?.state.doc;

    expect(updatedNode?.textContent).toBe("abcde");
  });

  it(`should update its internal doc when a node with different content is passed in, 
      with different content not at the beginning or end of the inner editor`, () => {
    const { view } = createEditorWithElements(
      [],
      "Some arbitrary text content"
    );
    const nodeName = getNodeNameFromField("testField", "doc");
    const node = testSchema.nodes[nodeName].create(
      {
        type: "text",
      },
      testSchema.text("apple")
    );
    const decorations = DecorationSet.create(view.state.doc, []);
    const fieldView = new TestProseMirrorFieldView(
      node,
      view,
      () => 0,
      0,
      decorations,
      textFieldDescription
    );
    const offset = fieldView.offset;
    const textFieldViewInnerEditor = fieldView.getInnerEditorView();
    if (!textFieldViewInnerEditor)
      throw new Error("Text field editor was undefined");

    const newNode = testSchema.nodes[nodeName].create(
      {
        type: "text",
      },
      testSchema.text("abcde")
    );
    fieldView.onUpdate(newNode, offset, decorations);
    const updatedNode = fieldView.getInnerEditorView()?.state.doc;

    expect(updatedNode?.textContent).toBe("abcde");
  });
});
