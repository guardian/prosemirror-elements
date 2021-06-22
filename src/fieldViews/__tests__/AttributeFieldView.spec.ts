import type { Node, NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { createEditorWithElements } from "../../__tests__/helpers";
import { getNodeSpecForProp } from "../../nodeSpec";
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
    ...(getNodeSpecForProp("doc", "testField", {
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

  it("should pass the correct value to its inheritors on createInnerView", () => {
    const { view } = createEditorWithElements([]);
    const node = testSchema.nodes.testField.create({
      type: "checkbox",
      fields: { value: true },
    });
    new TestAttributeFieldView(node, view, () => 0, 0);

    expect(createInnerViewSpy.mock.calls[0]).toEqual([{ value: true }]);
  });

  it("should pass the correct value to its inheritors on updateInnerView", () => {
    const { view } = createEditorWithElements([]);
    const node = testSchema.nodes.testField.create({
      type: "checkbox",
      fields: { value: false },
    });

    const fieldView = new TestAttributeFieldView(node, view, () => 0, 0);

    const newNode = testSchema.nodes.testField.create({
      fields: { value: true },
    });

    fieldView.update(newNode, 0);

    expect(updateInnerViewSpy.mock.calls[0]).toEqual([{ value: true }]);
  });
});
