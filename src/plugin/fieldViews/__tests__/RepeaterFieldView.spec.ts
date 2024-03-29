import type { Node } from "prosemirror-model";
import {
  createEditorWithElements,
  createNoopElement,
} from "../../helpers/test";
import { RepeaterFieldView } from "../RepeaterFieldView";

describe("RepeaterFieldView", () => {
  it("should add a repeater child at the start when index is -1", () => {
    testRepeaterMutation(
      ["Content 1", "Content 2", "Content 3"],
      (repeaterFieldView) => {
        repeaterFieldView.addChildAfter(-1);
      },
      [
        "paragraph",
        `paragraph("Content 1")`,
        `paragraph("Content 2")`,
        `paragraph("Content 3")`,
      ]
    );
  });

  it("should add a repeater child when index is -1, even when repeater is empty", () => {
    testRepeaterMutation(
      [],
      (repeaterFieldView) => {
        repeaterFieldView.addChildAfter(-1);
      },
      ["paragraph"]
    );
  });

  it("should add a repeater child at the end of the repeater", () => {
    testRepeaterMutation(
      ["Content 1", "Content 2", "Content 3"],
      (repeaterFieldView) => {
        repeaterFieldView.addChildAtEnd();
      },
      [
        `paragraph("Content 1")`,
        `paragraph("Content 2")`,
        `paragraph("Content 3")`,
        "paragraph",
      ]
    );
  });

  it("should add a repeater child at the end of the repeater, even when repeater is empty", () => {
    testRepeaterMutation(
      [],
      (repeaterFieldView) => {
        repeaterFieldView.addChildAtEnd();
      },
      ["paragraph"]
    );
  });

  it("should add a repeater child after a valid index", () => {
    testRepeaterMutation(
      ["Content 1", "Content 2", "Content 3"],
      (repeaterFieldView) => {
        repeaterFieldView.addChildAfter(1);
      },
      [
        `paragraph("Content 1")`,
        `paragraph("Content 2")`,
        "paragraph",
        `paragraph("Content 3")`,
      ]
    );
  });

  it("should do nothing if adding after an invalid index", () => {
    testRepeaterMutation(
      ["Content 1", "Content 2", "Content 3"],
      (repeaterFieldView) => {
        repeaterFieldView.addChildAfter(4);
        repeaterFieldView.addChildAfter(-2);
      },
      [
        `paragraph("Content 1")`,
        `paragraph("Content 2")`,
        `paragraph("Content 3")`,
      ]
    );
  });

  it("should remove a repeater child at a valid index", () => {
    testRepeaterMutation(
      ["Content 1", "Content 2", "Content 3"],
      (repeaterFieldView) => {
        repeaterFieldView.removeChildAt(1);
      },
      [`paragraph("Content 1")`, `paragraph("Content 3")`]
    );
  });

  it("should do nothing if removing at an invalid index", () => {
    testRepeaterMutation(
      ["Content 1", "Content 2", "Content 3"],
      (repeaterFieldView) => {
        repeaterFieldView.removeChildAt(4);
        repeaterFieldView.removeChildAt(-1);
      },
      [
        `paragraph("Content 1")`,
        `paragraph("Content 2")`,
        `paragraph("Content 3")`,
      ]
    );
  });

  it("should do nothing if removing a repeater child when we are at the minimum threshold for number of children", () => {
    const minChildren = 1;
    testRepeaterMutation(
      ["Content 1"],
      (repeaterFieldView) => {
        repeaterFieldView.removeChildAt(0);
      },
      [`paragraph("Content 1")`],
      minChildren
    );
  });

  it("should move repeater child at a valid index UP by one", () => {
    testRepeaterMutation(
      ["Content 1", "Content 2", "Content 3", "Content 4"],
      (repeaterFieldView) => {
        repeaterFieldView.moveChildUpOne(3);
      },
      [
        `paragraph("Content 1")`,
        `paragraph("Content 2")`,
        `paragraph("Content 4")`,
        `paragraph("Content 3")`,
      ]
    );
  });

  it("should move repeater child at a valid index DOWN by one", () => {
    testRepeaterMutation(
      ["Content 1", "Content 2", "Content 3", "Content 4"],
      (repeaterFieldView) => {
        repeaterFieldView.moveChildDownOne(0);
      },
      [
        `paragraph("Content 2")`,
        `paragraph("Content 1")`,
        `paragraph("Content 3")`,
        `paragraph("Content 4")`,
      ]
    );
  });

  it("should do nothing if moving a repeater child beyond the start or the end", () => {
    testRepeaterMutation(
      ["Content 1", "Content 2", "Content 3", "Content 4"],
      (repeaterFieldView) => {
        repeaterFieldView.moveChildUpOne(-1);
        repeaterFieldView.moveChildDownOne(-1);
        repeaterFieldView.moveChildUpOne(0);
        repeaterFieldView.moveChildDownOne(3);
      },
      [
        `paragraph("Content 1")`,
        `paragraph("Content 2")`,
        `paragraph("Content 3")`,
        `paragraph("Content 4")`,
      ]
    );
  });
});

const testRepeaterMutation = (
  initialContent: string[],
  mutation: (repeaterFieldView: RepeaterFieldView) => void,
  expectedFinalContent: string[],
  minChildren = 0
) => {
  const nestedTestElement = createNoopElement({
    nestedField: {
      type: "nestedElement",
      content: "block+",
    },
  });
  const testElement = createNoopElement({
    repeater1: {
      type: "repeater",
      fields: {
        field1: { type: "richText" },
      },
      minChildren: 0,
    },
  });
  const { view, insertElement } = createEditorWithElements({
    nestedTestElement,
    testElement,
  });

  insertElement({
    elementName: "testElement",
    values: {
      repeater1: initialContent.map((content) => ({
        field1: `<p>${content}</p>`,
      })),
    },
  })(view.state, view.dispatch);

  const testNodeBefore = view.state.doc.firstChild as Node;
  const repeaterNodeBefore = testNodeBefore.content.firstChild as Node;

  const repeaterFieldView = new RepeaterFieldView(
    repeaterNodeBefore,
    0,
    () => 0,
    view,
    "testRepeater",
    minChildren
  );

  mutation(repeaterFieldView);

  const testNodeAfter = view.state.doc.firstChild as Node;
  const repeaterNodeAfter = testNodeAfter.content.firstChild as Node;

  repeaterNodeAfter.content.forEach((node, _, index) => {
    expect(node.toString()).toBe(
      `testElement__repeater1__child(testElement__field1(${expectedFinalContent[index]}))`
    );
  });

  expect(repeaterNodeAfter.content.childCount).toBe(
    expectedFinalContent.length
  );
};
