import {
  createEditorWithElements,
  createNoopElement,
} from "../../helpers/test";
import { isNestedElementField } from "../NestedElementFieldView";

const nestedTestElement = createNoopElement({
  nestedField: {
    type: "nestedElement",
    content: "block+",
  },
});

describe("isNestedElementField", () => {
  it("should correctly identify a nested element field", () => {
    const { view, insertElement } = createEditorWithElements({
      nestedTestElement,
    });

    insertElement({
      elementName: "nestedTestElement",
      values: {
        nestedField: [],
      },
    })(view.state, view.dispatch);

    const docNode = view.state.doc;
    const nestedFieldNode = view.state.doc.firstChild?.firstChild;

    expect(isNestedElementField(docNode)).toBe(false);
    expect(!!nestedFieldNode && isNestedElementField(nestedFieldNode)).toBe(
      true
    );
  });
});
