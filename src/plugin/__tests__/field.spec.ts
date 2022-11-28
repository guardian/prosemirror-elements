import { DecorationSet } from "prosemirror-view";
import {
  getFieldsFromNode,
  updateFieldsFromNode,
  updateFieldViewsFromNode,
} from "../field";
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
        innerDecos: DecorationSet.empty,
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
        innerDecos: DecorationSet.empty,
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
          innerDecos: DecorationSet.empty,
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

    const additionalFieldOptions = {
      view,
      getPos: () => 0,
      innerDecos: DecorationSet.empty,
      serializer,
      fieldDescriptions: elements.example.fieldDescriptions,
    };

    const originalFields = getFieldsFromNode({
      node: originalNode,
      ...additionalFieldOptions,
    });

    it("should update a node with the correct value and error information", () => {
      const newElementNode = example(
        example__caption("caption new"),
        example__html("html new")
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        ...additionalFieldOptions,
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
        ...additionalFieldOptions,
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
          example__repeated__child(example__nestedText("New nested text"))
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,

        ...additionalFieldOptions,
      });

      expect(newFields.caption.value).toBe("caption new");
      expect(newFields.html.value).toBe("html new");
      expect(newFields.caption.errors.length).toEqual(1);
      expect(newFields.html.errors.length).toEqual(0);

      expect(newFields.repeated.children[0].nestedText.value).toEqual(
        "New nested text"
      );
    });

    it("should insert a new repeater node", () => {
      const newElementNode = example(
        example__caption("caption new"),
        example__html("html new"),
        example__repeated__parent(
          example__repeated__child(example__nestedText("Nested text")),
          example__repeated__child(example__nestedText("New nested text"))
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        ...additionalFieldOptions,
      });

      expect(newFields.repeated.children.length).toEqual(2);
      expect(newFields.repeated.children[1].nestedText.value).toEqual(
        "New nested text"
      );
      expect(newFields.repeated.children[0].nestedText.value).toEqual(
        "Nested text"
      );
      expect(newFields.repeated.children[1].nestedText.value).toEqual(
        "New nested text"
      );
    });

    it("should remove a repeater node - 1 node", () => {
      const newElementNode = example(
        example__caption("caption new"),
        example__html("html new"),
        example__repeated__parent()
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        ...additionalFieldOptions,
      });

      expect(newFields.repeated.children.length).toEqual(0);
    });

    it("should remove a repeater node - multiple nodes", () => {
      const originalNode = example(
        example__caption("caption new"),
        example__html("html new"),
        example__repeated__parent(
          example__repeated__child(example__nestedText("1")),
          example__repeated__child(example__nestedText("2")),
          example__repeated__child(example__nestedText("3"))
        )
      );

      const originalFields = getFieldsFromNode({
        node: originalNode,
        ...additionalFieldOptions,
      });

      const newElementNode = example(
        example__caption("caption new"),
        example__html("html new"),
        example__repeated__parent(
          example__repeated__child(example__nestedText("2"))
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        ...additionalFieldOptions,
      });

      expect(newFields.repeated.children.length).toEqual(1);
      expect(newFields.repeated.children[0].nestedText.value).toEqual("2");
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
        ...additionalFieldOptions,
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
        ...additionalFieldOptions,
      });

      expect(originalFields === newFields).toBe(true);
    });

    it("should throw when it cannot find the correct child nodes", () => {
      expect(() =>
        updateFieldsFromNode({
          node: p(),
          fields: originalFields,
          ...additionalFieldOptions,
        })
      ).toThrowError();
    });
  });

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
        innerDecos: DecorationSet.empty,
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
        innerDecos: DecorationSet.empty,
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
