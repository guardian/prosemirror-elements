import { DecorationSet } from "prosemirror-view";
import { getFieldsFromNode } from "../../field";
import { updateFieldViewsFromNode } from "../fieldView";
import {
  elements,
  example,
  example__caption,
  example__html,
  example__nestedText,
  example__repeated__child,
  example__repeated__parent,
  serializer,
  view,
} from "./fixtures";

describe("FieldView helpers", () => {
  describe("updateFieldViewsFromNode", () => {
    it("should update FieldViews in place when root nodes change", () => {
      const nestedNode = example__repeated__parent(
        example__repeated__child(example__nestedText("Nested text"))
      );
      const elementNode = example(
        example__caption("caption"),
        example__html("html"),
        nestedNode
      );

      const fields = getFieldsFromNode({
        node: elementNode,
        fieldDescriptions: elements.example.fieldDescriptions,
        view,
        getPos: () => 0,
        innerDecos: [],
        serializer,
      });

      const newNode = example(
        example__caption("Updated caption"),
        example__html("html"),
        nestedNode
      );

      // -2 to account for the offset into the parent node.
      const correctOffset =
        newNode.nodeSize - (nestedNode.firstChild?.nodeSize ?? 0) - 2;

      updateFieldViewsFromNode(
        fields,
        newNode,
        DecorationSet.create(view.state.doc, [])
      );

      expect(fields.caption.view.offset).toBe(0);
      expect(fields.repeated.children[0].nestedText.view.offset).toBe(
        correctOffset
      );
      expect(fields.html.view.offset).toBe(newNode.firstChild?.nodeSize);
    });

    it("should update FieldViews in place when repeater nodes change", () => {
      const nestedNode = example__repeated__parent(
        example__repeated__child(example__nestedText("Nested text"))
      );
      const elementNode = example(
        example__caption("caption"),
        example__html("html"),
        nestedNode
      );

      const fields = getFieldsFromNode({
        node: elementNode,
        fieldDescriptions: elements.example.fieldDescriptions,
        view,
        getPos: () => 0,
        innerDecos: [],
        serializer,
      });

      const newNestedNode = example__repeated__parent(
        example__repeated__child(example__nestedText("Updated nested text"))
      );
      const newNode = example(
        example__caption("Updated caption"),
        example__html("html"),
        newNestedNode
      );

      // -2 to account for the offset into the parent node.
      const correctOffset =
        newNode.nodeSize - (newNestedNode.firstChild?.nodeSize ?? 0) - 2;

      updateFieldViewsFromNode(
        fields,
        newNode,
        DecorationSet.create(view.state.doc, [])
      );

      expect(fields.caption.view.offset).toBe(0);
      expect(fields.repeated.children[0].nestedText.view.offset).toBe(
        correctOffset
      );
      expect(fields.html.view.offset).toBe(newNode.firstChild?.nodeSize);
    });
  });
});
