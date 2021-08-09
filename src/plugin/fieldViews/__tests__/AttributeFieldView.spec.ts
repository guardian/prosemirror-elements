import type { Node, NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { createEditorWithElements } from "../../helpers/test";
import { getNodeNameFromField, getNodeSpecForField } from "../../nodeSpec";
import { AttributeFieldView } from "../AttributeFieldView";

const createInnerViewSpy = jest.fn();
const updateInnerViewSpy = jest.fn();

type TestAttributeFields = { value: boolean };

class TestAttributeFieldView extends AttributeFieldView<TestAttributeFields> {
  public static propName = "checkbox" as const;
  public static defaultValue = "default";

  public getNodeValue(node: Node): TestAttributeFields {
    return node.attrs.fields as TestAttributeFields;
  }

  protected createInnerView(fields: TestAttributeFields) {
    createInnerViewSpy(fields);
  }

  protected updateInnerView(fields: TestAttributeFields) {
    updateInnerViewSpy(fields);
  }
}

const testSchema = new Schema({
  nodes: {
    doc: schema.nodes.doc,
    text: schema.nodes.text,
    ...(getNodeSpecForField("doc", "testField", {
      type: "checkbox",
      defaultValue: { value: false },
    }) as { testField: NodeSpec }),
  },
});

describe("AttributeFieldView", () => {
  beforeEach(() => {
    createInnerViewSpy.mockReset();
    updateInnerViewSpy.mockReset();
  });
  it("should pass the correct value to its inheritors on updateInnerView", () => {
    const { view } = createEditorWithElements([]);
    const nodeName = getNodeNameFromField("testField", "doc");
    const node = testSchema.nodes[nodeName].create({
      type: "checkbox",
      fields: { value: false },
    });

    const fieldView = new TestAttributeFieldView(node, view, () => 0, 0);

    const newNode = testSchema.nodes[nodeName].create({
      fields: { value: true },
    });

    fieldView.onUpdate(newNode, 0);

    expect(updateInnerViewSpy.mock.calls[0]).toEqual([{ value: true }]);
  });
});
