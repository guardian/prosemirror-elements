import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { builders } from "prosemirror-test-builder";
import { getFieldsFromNode, updateFieldsFromNode } from "../field";
import { createTextField } from "../fieldViews/TextFieldView";
import { createEditorWithElements, createNoopElement } from "../helpers/test";
import { maxLength, required } from "../helpers/validation";

const elements = {
  example: createNoopElement({
    caption: createTextField({
      validators: [required(), maxLength(7)],
    }),
    html: createTextField({
      validators: [required()],
    }),
  }),
};

const { view, nodeSpec, serializer } = createEditorWithElements(elements);

const schema = new Schema({
  // eslint-disable-next-line -- the basic schema types should guarantee this is a NodeSpec
  nodes: (basicSchema.spec.nodes as any).append(nodeSpec),
  marks: basicSchema.spec.marks,
});

const { example, example__caption, example__html } = builders(schema, {});

describe("Field helpers", () => {
  describe("getFieldsFromElementNode", () => {
    it("should create a Field from a node with the correct value information", () => {
      const elementNode = example(
        example__caption("caption"),
        example__html("html")
      );

      const fields = getFieldsFromNode({
        node: elementNode,
        element: elements.example,
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
        element: elements.example,
        view,
        getPos: () => 0,
        innerDecos: [],
        serializer,
      });

      expect(fields.caption.errors.length).toEqual(1);
      expect(fields.html.errors.length).toEqual(1);
    });
  });

  describe("updateFieldsAndErrorsFromNode", () => {
    const originalNode = example(
      example__caption("caption"),
      example__html("html")
    );

    const originalFields = getFieldsFromNode({
      node: originalNode,
      element: elements.example,
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

    it("should create a new object identity when changes are made", () => {
      const newElementNode = example(
        example__caption("caption new"),
        example__html("html new")
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
        example__html("html")
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        serializer,
      });

      expect(originalFields === newFields).toBe(true);
    });
  });
});
