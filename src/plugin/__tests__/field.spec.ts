import { DecorationSet } from "prosemirror-view";
import { buildElementPlugin } from "../element";
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
  example__nestedElementField,
  example__repeated__child,
  example__repeated__parent,
  example__repeaterText,
  exampleElementToNest,
  exampleElementToNest__content,
  p,
  serializer,
  view,
} from "../helpers/__tests__/fixtures";
import { createGetElementDataFromNode } from "../helpers/element";

const fieldDescriptions = {
  ...elements.example.fieldDescriptions,
  ...elements.exampleElementToNest.fieldDescriptions,
};

const typeProvider = createGetElementDataFromNode(example);

const {
  getElementDataFromNode: getElementDataFromNodeUnknown,
} = buildElementPlugin(elements);

const getElementDataFromNode = (getElementDataFromNodeUnknown as unknown) as typeof typeProvider;

describe("Field helpers", () => {
  describe("getFieldsFromElementNode", () => {
    it("should create a Field from a node with the correct value information", () => {
      const elementNode = example(
        example__caption("caption"),
        example__html("html")
      );

      const fields = getFieldsFromNode({
        node: elementNode,
        fieldDescriptions,
        view,
        getPos: () => 0,
        innerDecos: DecorationSet.empty,
        serializer,
        getElementDataFromNode,
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
        getElementDataFromNode,
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
          getElementDataFromNode,
        })
      ).toThrowError();
    });
  });

  describe("updateFieldsFromNode", () => {
    const originalNode = example(
      example__caption("caption"),
      example__html("html"),
      example__repeated__parent(
        example__repeated__child(example__repeaterText("Repeater text"))
      ),
      example__nestedElementField(
        exampleElementToNest(
          exampleElementToNest__content("Nested element content")
        )
      )
    );

    const additionalFieldOptions = {
      view,
      getPos: () => 0,
      innerDecos: DecorationSet.empty,
      serializer,
      fieldDescriptions,
    };

    const originalFields = getFieldsFromNode({
      node: originalNode,
      getElementDataFromNode,
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
        getElementDataFromNode,
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
          example__repeated__child(example__repeaterText("New repeater text"))
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        ...additionalFieldOptions,
        getElementDataFromNode,
      });

      expect(newFields.caption.value).toBe("caption new");
      expect(newFields.html.value).toBe("html new");
      expect(newFields.caption.errors.length).toEqual(1);
      expect(newFields.html.errors.length).toEqual(0);

      expect(newFields.repeated.children[0].repeaterText.value).toEqual(
        "New repeater text"
      );
    });

    it("should create a new object identity when changes are made", () => {
      const newElementNode = example(
        example__caption("caption new"),
        example__html("html new"),
        example__repeated__parent(
          example__repeated__child(example__repeaterText("New repeater text"))
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        getElementDataFromNode,
        ...additionalFieldOptions,
      });

      expect(newFields.caption.value).toBe("caption new");
      expect(newFields.html.value).toBe("html new");
      expect(newFields.caption.errors.length).toEqual(1);
      expect(newFields.html.errors.length).toEqual(0);

      expect(newFields.repeated.children[0].repeaterText.value).toEqual(
        "New repeater text"
      );
    });

    it("should insert a new repeater node", () => {
      const newElementNode = example(
        example__caption("caption new"),
        example__html("html new"),
        example__repeated__parent(
          example__repeated__child(example__repeaterText("Repeater text")),
          example__repeated__child(example__repeaterText("New repeater text"))
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        getElementDataFromNode,
        ...additionalFieldOptions,
      });

      expect(newFields.repeated.children.length).toEqual(2);
      expect(newFields.repeated.children[1].repeaterText.value).toEqual(
        "New repeater text"
      );
      expect(newFields.repeated.children[0].repeaterText.value).toEqual(
        "Repeater text"
      );
      expect(newFields.repeated.children[1].repeaterText.value).toEqual(
        "New repeater text"
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
        getElementDataFromNode,
        ...additionalFieldOptions,
      });

      expect(newFields.repeated.children.length).toEqual(0);
    });

    it("should remove a repeater node - multiple nodes", () => {
      const originalNode = example(
        example__caption("caption new"),
        example__html("html new"),
        example__repeated__parent(
          example__repeated__child(example__repeaterText("1")),
          example__repeated__child(example__repeaterText("2")),
          example__repeated__child(example__repeaterText("3"))
        )
      );

      const originalFields = getFieldsFromNode({
        node: originalNode,
        getElementDataFromNode,
        ...additionalFieldOptions,
      });

      const newElementNode = example(
        example__caption("caption new"),
        example__html("html new"),
        example__repeated__parent(
          example__repeated__child(example__repeaterText("2"))
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        getElementDataFromNode,
        ...additionalFieldOptions,
      });

      expect(newFields.repeated.children.length).toEqual(1);
      expect(newFields.repeated.children[0].repeaterText.value).toEqual("2");
    });

    it("should correctly change the value of an element's content within a nestedElementField", () => {
      const newElementNode = example(
        example__nestedElementField(
          exampleElementToNest(
            exampleElementToNest__content(
              "Updated nested element content updated"
            )
          )
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        getElementDataFromNode,
        ...additionalFieldOptions,
      });

      const expected = [
        {
          assets: [],
          elementType: "exampleElementToNest",
          fields: { content: "Updated nested element content updated" },
        },
      ];
      expect(newFields.nestedElementField.value.toString()).toBe(
        expected.toString()
      );
    });

    it("should insert a new element into a nestedElementField", () => {
      const newElementNode = example(
        example__nestedElementField(
          exampleElementToNest(
            exampleElementToNest__content("Nested element content")
          ),
          exampleElementToNest(
            exampleElementToNest__content("Nested element 2 content")
          )
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        getElementDataFromNode,
        ...additionalFieldOptions,
      });

      const expected = [
        {
          assets: [],
          elementType: "exampleElementToNest",
          fields: { content: "Nested element content" },
        },
        {
          assets: [],
          elementType: "exampleElementToNest",
          fields: { content: "Nested element 2 content" },
        },
      ];

      expect(newFields.nestedElementField.value.toString()).toEqual(
        expected.toString()
      );
    });

    it("should remove an element from a nestedElementField", () => {
      const newElementNode = example(example__nestedElementField());

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        getElementDataFromNode,
        ...additionalFieldOptions,
      });

      expect(newFields.nestedElementField.value).not.toContain(
        "Nested element content"
      );
    });

    it("should create a new object identity when changes are made", () => {
      const newElementNode = example(
        example__caption("caption new"),
        example__html("html new"),
        example__repeated__parent(
          example__repeated__child(example__repeaterText("Repeater text"))
        ),
        example__nestedElementField(
          exampleElementToNest(
            exampleElementToNest__content("Nested element content")
          )
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        getElementDataFromNode,
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
          example__repeated__child(example__repeaterText("Repeater text"))
        ),
        example__nestedElementField(
          exampleElementToNest(
            exampleElementToNest__content("Nested element content")
          )
        )
      );

      const newFields = updateFieldsFromNode({
        node: newElementNode,
        fields: originalFields,
        getElementDataFromNode,
        ...additionalFieldOptions,
      });

      expect(originalFields).toEqual(newFields);

      expect(originalFields === newFields).toBe(true);
    });

    it("should throw when it cannot find the correct child nodes", () => {
      expect(() =>
        updateFieldsFromNode({
          node: p(),
          fields: originalFields,
          getElementDataFromNode,
          ...additionalFieldOptions,
        })
      ).toThrowError();
    });
  });

  describe("updateFieldViewsFromNode", () => {
    it("should update FieldViews in place when root nodes change", () => {
      const nestedNode = example__repeated__parent(
        example__repeated__child(example__repeaterText("Repeater text"))
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
        getElementDataFromNode,
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
      expect(fields.repeated.children[0].repeaterText.view.offset).toBe(
        correctOffset
      );
      expect(fields.html.view.offset).toBe(newNode.firstChild?.nodeSize);
    });

    it("should update FieldViews in place when repeater nodes change", () => {
      const nestedNode = example__repeated__parent(
        example__repeated__child(example__repeaterText("Repeater text"))
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
        getElementDataFromNode,
      });

      const newNestedNode = example__repeated__parent(
        example__repeated__child(example__repeaterText("Updated repeater text"))
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
      expect(fields.repeated.children[0].repeaterText.view.offset).toBe(
        correctOffset
      );
      expect(fields.html.view.offset).toBe(newNode.firstChild?.nodeSize);
    });

    it("should update FieldViews in place when elements within a nestedElementField change", () => {
      const nestedNode = example__repeated__parent(
        example__repeated__child(example__repeaterText("Repeater text"))
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
        getElementDataFromNode,
      });

      const newNestedNode = example__repeated__parent(
        example__repeated__child(example__repeaterText("Updated repeater text"))
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
      expect(fields.repeated.children[0].repeaterText.view.offset).toBe(
        correctOffset
      );
      expect(fields.html.view.offset).toBe(newNode.firstChild?.nodeSize);
    });
  });
});
