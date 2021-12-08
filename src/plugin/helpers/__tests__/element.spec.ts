import { doc, p } from "prosemirror-test-builder";
import { findValidInsertPositionWithinElement } from "../element";
import { createEditorWithElements, createNoopElement } from "../test";

describe("Element helpers", () => {
  describe("findValidInsertPositionWithinElement", () => {
    const testElement = createNoopElement({
      field1: { type: "richText" },
      field2: { type: "richText" },
    });
    const { view, insertElement } = createEditorWithElements({
      testElement,
    });
    insertElement({
      elementName: "testElement",
      values: { field1: "Field text", field2: "Also field text" },
    })(view.state, view.dispatch);

    // This position should be at the end of the element. We use the end of the
    // document as an anchor and adjust backwards:
    //   -1 because positions are zero-indexed
    //   -1 for the position at the end of the document
    //   -1 for the position at the end of the element
    const endElementPosition = view.state.doc.nodeSize - 3;

    it("should not return a position if not within an element", () => {
      const docNode = doc(p("Example doc"));
      const pos = docNode.resolve(2);
      expect(findValidInsertPositionWithinElement(pos)).toBe(undefined);
    });

    it("should return a position at the root of the element if the position is within one", () => {
      const pos = view.state.doc.resolve(4);

      expect(findValidInsertPositionWithinElement(pos)).toBe(
        endElementPosition
      );
    });

    it("should not matter where in the element a position falls", () => {
      // In the middle of the element, in the first field
      const firstPos = findValidInsertPositionWithinElement(
        view.state.doc.resolve(4)
      );
      // Also in the middle of the element, in the second field
      const secondPos = findValidInsertPositionWithinElement(
        view.state.doc.resolve(20)
      );

      expect(firstPos).toBe(secondPos);
    });
  });
});
