import type { NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { TextSelection, Transaction } from "prosemirror-state";
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

const mockDispatchToOuterView = jest.fn();

class TestProseMirrorFieldViewWithOuterViewSpy extends TextFieldView {
  getInnerEditorView = () => {
    return this.innerEditorView;
  };

  dispatchToOuterView = mockDispatchToOuterView;
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
  marks: {
    strike: {
      parseDOM: [{ tag: "s" }, { tag: "del" }, { tag: "strike" }],
      toDOM() {
        return ["s"];
      },
    },
  },
});

const getEditorWithTextField = () => {
  const { view } = createEditorWithElements([], "Some arbitrary text content");
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
  if (!textFieldViewInnerEditor) {
    throw new Error("Text field editor was undefined");
  }
  return {
    view,
    nodeName,
    node,
    decorations,
    fieldView,
    offset,
    textFieldViewInnerEditor,
  };
};

const textFieldDescription: TextFieldDescription = {
  type: "text",
  isMultiline: false,
  rows: 4,
  isCode: false,
};

describe("the TextFieldView, as an extension of the ProseMirrorFieldView", () => {
  it("should update its internal selection when a new selection is passed in, encompassed within its range", () => {
    const {
      node,
      decorations,
      fieldView,
      offset,
      textFieldViewInnerEditor,
    } = getEditorWithTextField();

    const initialSelection = textFieldViewInnerEditor.state.selection;
    // Offset the initial selection so that it is within the inner editor's field
    const offsetMap = StepMap.offset(3);
    const mappedSelection = initialSelection.map(
      textFieldViewInnerEditor.state.tr.doc,
      offsetMap
    );
    fieldView.onUpdate(node, offset, decorations, mappedSelection);
    const updatedSelection = textFieldViewInnerEditor.state.selection;

    expect(initialSelection.from).toBe(0);
    expect(initialSelection.to).toBe(0);
    // Selection is positioned at '1' relative to the outer editor, rather than 3, because
    // the inner editor is offset by 2
    expect(updatedSelection.from).toBe(1);
    expect(updatedSelection.to).toBe(1);
  });

  it("should not update its internal selection when a selection is passed in outside of its range", () => {
    const {
      view,
      node,
      decorations,
      fieldView,
      offset,
      textFieldViewInnerEditor,
    } = getEditorWithTextField();

    const initialSelection = textFieldViewInnerEditor.state.selection;
    // A selection that will be outside the innerEditor's range
    const newSelection = TextSelection.create(view.state.doc, 15, 15);
    fieldView.onUpdate(node, offset, decorations, newSelection);
    const updatedSelection = textFieldViewInnerEditor.state.selection;

    expect(initialSelection.from).toBe(0);
    expect(initialSelection.to).toBe(0);
    expect(updatedSelection.from).toBe(0);
    expect(updatedSelection.to).toBe(0);
  });

  it(`should update its internal doc when a node with different content is passed in, 
      with different content starting at the first position of the inner editor`, () => {
    const {
      nodeName,
      decorations,
      fieldView,
      offset,
    } = getEditorWithTextField();

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
    const {
      nodeName,
      decorations,
      fieldView,
      offset,
      textFieldViewInnerEditor,
    } = getEditorWithTextField();

    const newNode = testSchema.nodes[nodeName].create(
      {
        type: "text",
      },
      testSchema.text("abcde")
    );
    fieldView.onUpdate(newNode, offset, decorations);
    const updatedNode = textFieldViewInnerEditor.state.doc;

    expect(updatedNode.textContent).toBe("abcde");
  });

  it(`should update its internal doc when a node with different content is passed in, 
      with different content not at the beginning or end of the inner editor`, () => {
    const {
      nodeName,
      decorations,
      fieldView,
      offset,
      textFieldViewInnerEditor,
    } = getEditorWithTextField();

    const newNode = testSchema.nodes[nodeName].create(
      {
        type: "text",
      },
      testSchema.text("abcde")
    );
    fieldView.onUpdate(newNode, offset, decorations);
    const updatedNode = textFieldViewInnerEditor.state.doc;

    expect(updatedNode.textContent).toBe("abcde");
  });

  it("should store a mark when the outerEditor updates it with an array of marks", () => {
    const {
      node,
      decorations,
      fieldView,
      offset,
      textFieldViewInnerEditor,
    } = getEditorWithTextField();
    const initialMarks = textFieldViewInnerEditor.state.storedMarks;

    const exampleMark = testSchema.marks.strike.create();
    fieldView.onUpdate(node, offset, decorations, undefined, [exampleMark]);

    const updatedMarks = textFieldViewInnerEditor.state.storedMarks;

    expect(initialMarks).toBe(null);
    expect(updatedMarks).toStrictEqual([exampleMark]);
  });

  it("should not have a storedMark in its inner editor state when the outerEditor updates it with an array of marks, then with an empty array", () => {
    const {
      node,
      decorations,
      fieldView,
      offset,
      textFieldViewInnerEditor,
    } = getEditorWithTextField();
    const initialMarks = textFieldViewInnerEditor.state.storedMarks;

    const exampleMark = testSchema.marks.strike.create();
    fieldView.onUpdate(node, offset, decorations, undefined, [exampleMark]);
    const updatedMarks = textFieldViewInnerEditor.state.storedMarks;
    fieldView.onUpdate(node, offset, decorations, undefined, []);
    const removedMarks = textFieldViewInnerEditor.state.storedMarks;

    expect(initialMarks).toBe(null);
    expect(updatedMarks).toStrictEqual([exampleMark]);
    expect(removedMarks).toStrictEqual([]);
  });

  it("should not have a storedMark in its inner editor state when the outerEditor updates it first with an array of marks, then with null", () => {
    const {
      node,
      decorations,
      fieldView,
      offset,
      textFieldViewInnerEditor,
    } = getEditorWithTextField();
    const initialMarks = textFieldViewInnerEditor.state.storedMarks;

    const exampleMark = testSchema.marks.strike.create();
    fieldView.onUpdate(node, offset, decorations, undefined, [exampleMark]);
    const updatedMarks = textFieldViewInnerEditor.state.storedMarks;
    fieldView.onUpdate(node, offset, decorations, undefined, null);
    const removedMarks = textFieldViewInnerEditor.state.storedMarks;

    expect(initialMarks).toBe(null);
    expect(updatedMarks).toStrictEqual([exampleMark]);
    expect(removedMarks).toStrictEqual(null);
  });

  it("should preserve 'paste' meta in transactions dispatched to the outer editor", () => {
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
    const fieldView = new TestProseMirrorFieldViewWithOuterViewSpy(
      node,
      view,
      () => 0,
      0,
      decorations,
      textFieldDescription
    );
    const textFieldViewInnerEditor = fieldView.getInnerEditorView();
    if (!textFieldViewInnerEditor) {
      throw new Error("Text field editor was undefined");
    }

    // const initialSelection = textFieldViewInnerEditor.state.selection;
    // // A selection that will be outside the innerEditor's range
    // const newSelection = TextSelection.create(view.state.doc, 15, 15);
    // fieldView.onUpdate(node, offset, decorations, newSelection);
    const tr = textFieldViewInnerEditor.state.tr;
    tr.setMeta("paste", true);
    textFieldViewInnerEditor.dispatch(tr);

    expect(mockDispatchToOuterView.mock.calls).toHaveLength(1);
    expect(
      (mockDispatchToOuterView.mock.calls[0] as Transaction[])[0]
    ).toHaveProperty("meta", { paste: true });
  });
});
