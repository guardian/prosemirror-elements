import { getFieldsFromNode, updateFieldsFromNode } from "../field";
import {
  elements,
  example,
  example__caption,
  example__html,
  example__nestedText,
  example__repeated__child,
  example__repeated__parent,
  p,
  serializer,
  view,
} from "../helpers/__tests__/fixtures";

describe("Field helpers", () => {
  describe("getFieldsFromElementNode", () => {
    it("should create a Field from a node with the correct value information", () => {
      const elementNode = example(
        example__caption("caption"),
        example__html("html")
      );

      const fields = getFieldsFromNode({
        node: elementNode,
        fieldDescriptions: elements.example.fieldDescriptions,
        view,
        getPos: () => 0,
        innerDecos: [],
        serializer,
      });

      expect(fields.caption.value).toBe("caption");
      expect(fields.html.value).toBe("html");
      expect(fields.caption.errors.length).toEqual(0);
      expect(fields.html.errors.length).toEqual(0);
    });

    it("should create a Field from a node with the correct error information", () => {
      const elementNode = example(
        example__caption("caption, but too long"),
        example__html("")
      );

      const fields = getFieldsFromNode({
        node: elementNode,
        fieldDescriptions: elements.example.fieldDescriptions,
        view,
        getPos: () => 0,
        innerDecos: [],
        serializer,
      });

      expect(fields.caption.errors.length).toEqual(1);
      expect(fields.html.errors.length).toEqual(1);
    });

    it("should throw when it cannot find the correct child nodes", () => {
      expect(() =>
        getFieldsFromNode({
          node: p(),
          fieldDescriptions: elements.example.fieldDescriptions,
          view,
          getPos: () => 0,
          innerDecos: [],
          serializer,
        })
      ).toThrowError();
    });
  });

  describe("updateFieldsAndErrorsFromNode", () => {
    const originalNode = example(
      example__caption("caption"),
      example__html("html"),
      example__repeated__parent(
        example__repeated__child(example__nestedText("Nested text"))
      )
    );

    const originalFields = getFieldsFromNode({
      node: originalNode,
      fieldDescriptions: elements.example.fieldDescriptions,
      view,
      getPos: () => 0,
      innerDecos: [],
      serializer,
    });

    it("should update a node with the correct value and error information", () => {
      const newElementNode = example(
        example__caption("caption new"),
        example__html("html new")
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        serializer,
      });

      expect(newFields.caption.value).toBe("caption new");
      expect(newFields.html.value).toBe("html new");
      expect(newFields.caption.errors.length).toEqual(1);
      expect(newFields.html.errors.length).toEqual(0);
    });

    it("should update a repeater node with the correct value and error information", () => {
      const newElementNode = example(
        example__caption("caption new"),
        example__html("html new"),
        example__repeated__parent(
          example__repeated__child(example__nestedText("New nested text"))
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        serializer,
      });

      expect(newFields.caption.value).toBe("caption new");
      expect(newFields.html.value).toBe("html new");
      expect(newFields.caption.errors.length).toEqual(1);
      expect(newFields.html.errors.length).toEqual(0);

      expect(newFields.repeated.children[0].nestedText.value).toEqual(
        "New nested text"
      );
    });

    it("should create a new object identity when changes are made", () => {
      const newElementNode = example(
        example__caption("caption new"),
        example__html("html new"),
        example__repeated__parent(
          example__repeated__child(example__nestedText("Nested text"))
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        serializer,
      });

      expect(originalFields === newFields).toBe(false);
    });

    it("should not create a new object identity when there is nothing to update", () => {
      // This new node contains the same information, and should result in a
      // no-op update.
      const newElementNode = example(
        example__caption("caption"),
        example__html("html"),
        example__repeated__parent(
          example__repeated__child(example__nestedText("Nested text"))
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        serializer,
      });

      expect(originalFields === newFields).toBe(true);
    });

    it("should throw when it cannot find the correct child nodes", () => {
      expect(() =>
        updateFieldsFromNode({
          node: p(),
          fields: originalFields,
          serializer,
        })
      ).toThrowError();
    });
  });
});
