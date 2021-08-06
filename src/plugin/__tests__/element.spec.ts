import type { Node } from "prosemirror-model";
import { buildElementPlugin } from "../element";
import type { CustomField } from "../fieldViews/CustomFieldView";
import {
  createEditorWithElements,
  createNoopElement,
  trimHtml,
} from "../helpers/test";

describe("buildElementPlugin", () => {
  describe("Typesafety", () => {
    it("should allow consumers to instantiate elements", () => {
      const testElement = createNoopElement({});
      const { insertElement } = buildElementPlugin({ testElement });
      insertElement("testElement", {});
    });

    it("should allow consumers to instantiate multiple elements", () => {
      const testElement = createNoopElement({});
      const testElement2 = createNoopElement({});
      const { insertElement } = buildElementPlugin({
        testElement,
        testElement2,
      });
      insertElement("testElement", {});
      insertElement("testElement2", {});
    });

    it("should not allow consumers to instantiate elements that do not exist", () => {
      const testElement = createNoopElement({});
      const testElement2 = createNoopElement({});
      const { insertElement } = buildElementPlugin({
        testElement,
        testElement2,
      });
      // @ts-expect-error -- we should not be able to insert a non-existent element
      insertElement("testElementThatDoesNotExist", {});
    });

    it("should allow consumers to instantiate elements with a partial set of initial fields", () => {
      const testElement = createNoopElement({
        field1: { type: "richText" },
        field2: { type: "richText" },
      });
      const { insertElement } = buildElementPlugin({ testElement });
      insertElement("testElement", { field1: "<p>Example initial state</p>" });
    });

    it("should allow consumers to instantiate elements with a partial set of initial fields -- multiple elements", () => {
      const testElement = createNoopElement({
        field1: { type: "richText" },
      });
      const testElement2 = createNoopElement({
        field2: { type: "richText" },
      });
      const { insertElement } = buildElementPlugin({
        testElement,
        testElement2,
      });
      insertElement("testElement2", { field2: "<p>Example initial state</p>" });
    });

    it("should allow consumers to instantiate custom elements", () => {
      const testElement = createNoopElement({
        field1: { type: "richText" },
        field2: {
          type: "custom",
          defaultValue: { arbitraryValue: "hai" },
        } as CustomField<{ arbitraryValue: string }>,
      });
      const { insertElement } = buildElementPlugin({ testElement });
      insertElement("testElement", {
        field1: "<p>Example initial state</p>",
        field2: { arbitraryValue: "hai" },
      });
    });

    it("should allow consumers to instantiate custom elements with custom props", () => {
      const noop = () => {
        return;
      };

      const createFieldSpec = (callback: () => void) => {
        return {
          field1: { type: "richText" },
          field2: {
            type: "custom",
            defaultValue: { arbitraryValue: "hai" },
            props: {
              callback,
            },
          } as CustomField<
            { arbitraryValue: string },
            { callback: () => void }
          >,
        } as const;
      };

      const testElement = createNoopElement(createFieldSpec(noop));

      const { insertElement } = buildElementPlugin({ testElement });
      insertElement("testElement", {
        field1: "<p>Example initial state</p>",
        field2: { arbitraryValue: "hai" },
      });
    });

    it("should not allow consumers to instantiate elements with fields that do not exist", () => {
      const testElement = createNoopElement({
        field1: { type: "richText" },
      });
      const { insertElement } = buildElementPlugin({ testElement });
      insertElement("testElement", {
        // @ts-expect-error -- we should not be able to insert a non-existent field
        propDoesNotExist: "<p>Example initial state</p>",
      });
    });

    it("should not allow consumers to instantiate elements with fields that do not exist -- multiple elements", () => {
      const testElement = createNoopElement({
        field1: { type: "richText" },
      });
      const testElement2 = createNoopElement({
        field2: { type: "richText" },
      });
      const { insertElement } = buildElementPlugin({
        testElement,
        testElement2,
      });
      insertElement("testElement2", {
        // @ts-expect-error -- we should not be able to insert a non-existent field
        propDoesNotExist: "<p>Example initial state</p>",
      });
    });

    it("should not allow fields to be instantiated with an incorrect type", () => {
      const testElement = createNoopElement({
        field1: { type: "checkbox", defaultValue: { value: false } },
      });
      const { insertElement } = buildElementPlugin({ testElement });
      insertElement("testElement", {
        field1: { value: true },
      });
      insertElement("testElement", {
        // @ts-expect-error -- we should not be able to insert a field of the wrong type
        field1: "This shouldn't typecheck",
      });
    });

    it("should not allow consumers to instantiate custom elements with an incorrect type", () => {
      const testElement = createNoopElement({
        field1: {
          type: "custom",
          defaultValue: { arbitraryValue: "hai" },
        } as CustomField<{ arbitraryValue: string }>,
      });
      const { insertElement } = buildElementPlugin({ testElement });
      insertElement("testElement", {
        // @ts-expect-error -- we should not be able to insert a custom field of the wrong type
        field1: { doesNotExist: "hai" },
      });
    });
  });

  describe("Element creation and serialisation", () => {
    it("should create an element with default content when no fields are supplied", () => {
      const testElement = createNoopElement({
        field1: { type: "checkbox", defaultValue: { value: false } },
        field2: { type: "richText", defaultValue: "<p>Content</p>" },
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements({ testElement });

      insertElement("testElement")(view.state, view.dispatch);

      const expected =
        '<testelement type="testElement" has-errors="false"><element-testelement-field1 class="ProsemirrorElement__testElement-field1" fields="{&quot;value&quot;:false}"></element-testelement-field1><element-testelement-field2 class="ProsemirrorElement__testElement-field2"><p>Content</p></element-testelement-field2></testelement>';
      expect(getElementAsHTML()).toBe(expected);
    });

    it("should fill out fields in ATTRIBUTE nodes", () => {
      const testElement = createNoopElement({
        field1: { type: "checkbox", defaultValue: { value: false } },
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements({ testElement });

      insertElement("testElement", { field1: { value: true } })(
        view.state,
        view.dispatch
      );

      const expected =
        '<testelement type="testElement" has-errors="false"><element-testelement-field1 class="ProsemirrorElement__testElement-field1" fields="{&quot;value&quot;:true}"></element-testelement-field1></testelement>';
      expect(getElementAsHTML()).toBe(expected);
    });

    it("should fill out content in CONTENT nodes", () => {
      const testElement = createNoopElement({
        field1: { type: "richText" },
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements({ testElement });

      insertElement("testElement", { field1: "<p>Content</p>" })(
        view.state,
        view.dispatch
      );

      const expected =
        '<testelement type="testElement" has-errors="false"><element-testelement-field1 class="ProsemirrorElement__testElement-field1"><p>Content</p></element-testelement-field1></testelement>';
      expect(getElementAsHTML()).toBe(expected);
    });

    it("should allow partial fields", () => {
      const testElement = createNoopElement({
        field1: { type: "richText" },
        field2: { type: "richText", defaultValue: "<p>Default</p>" },
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements({ testElement });

      insertElement("testElement", { field1: "<p>Content</p>" })(
        view.state,
        view.dispatch
      );

      const expected =
        '<testelement type="testElement" has-errors="false"><element-testelement-field1 class="ProsemirrorElement__testElement-field1"><p>Content</p></element-testelement-field1><element-testelement-field2 class="ProsemirrorElement__testElement-field2"><p>Default</p></element-testelement-field2></testelement>';
      expect(getElementAsHTML()).toBe(expected);
    });

    it("should fill out all fields", () => {
      const testElement = createNoopElement({
        field1: { type: "richText" },
        field2: { type: "richText" },
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements({ testElement });

      insertElement("testElement", {
        field1: "<p>Content for field1</p>",
        field2: "<p>Content for field2</p>",
      })(view.state, view.dispatch);

      const expected =
        '<testelement type="testElement" has-errors="false"><element-testelement-field1 class="ProsemirrorElement__testElement-field1"><p>Content for field1</p></element-testelement-field1><element-testelement-field2 class="ProsemirrorElement__testElement-field2"><p>Content for field2</p></element-testelement-field2></testelement>';
      expect(getElementAsHTML()).toBe(expected);
    });

    it("should fill out fields in custom nodes", () => {
      const testElement = createNoopElement({
        field1: {
          type: "custom",
          defaultValue: { arbitraryValue: "hai" },
        } as CustomField<{ arbitraryValue: string }>,
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements({ testElement });

      insertElement("testElement", { field1: { arbitraryValue: "hai" } })(
        view.state,
        view.dispatch
      );

      const expected =
        '<testelement type="testElement" has-errors="false"><element-testelement-field1 class="ProsemirrorElement__testElement-field1" fields="{&quot;arbitraryValue&quot;:&quot;hai&quot;}"></element-testelement-field1></testelement>';
      expect(getElementAsHTML()).toBe(expected);
    });
  });

  describe("Element parsing", () => {
    it("should parse fields of all types, respecting values against defaults", () => {
      const elementHTML = `
        <testelement type="testElement" has-errors="false">
        <element-testelement-field1 class="ProsemirrorElement__testElement-field1"><p>Content</p></element-testelement-field1>
        <element-testelement-field2 class="ProsemirrorElement__testElement-field2">Content</element-testelement-field2>
        <element-testelement-field3 class="ProsemirrorElement__testElement-field3" fields="{&quot;value&quot;:true}"></element-testelement-field3>
        </testelement>
      `;

      const testElement = createNoopElement({
        field1: { type: "richText", defaultValue: "<p>Default</p>" },
        field2: {
          type: "text",
          defaultValue: "Default",
          isMultiline: false,
          rows: 1,
          isCode: false,
        },
        field3: { type: "checkbox", defaultValue: { value: false } },
      });

      const { getElementAsHTML } = createEditorWithElements(
        { testElement },
        elementHTML
      );

      expect(getElementAsHTML()).toBe(trimHtml(elementHTML));
    });

    it("should parse fields of all types, handling empty content values correctly", () => {
      const elementHTML = `
        <testelement type="testElement" has-errors="false">
        <element-testelement-field1 class="ProsemirrorElement__testElement-field1"><p></p></element-testelement-field1>
        <element-testelement-field2 class="ProsemirrorElement__testElement-field2"></element-testelement-field2>
        <element-testelement-field3 class="ProsemirrorElement__testElement-field3" fields="{&quot;value&quot;:true}"></element-testelement-field3>
        </testelement>
      `;

      const testElement = createNoopElement({
        field1: { type: "richText", defaultValue: "<p>Default</p>" },
        field2: {
          type: "text",
          defaultValue: "Default",
          isMultiline: false,
          rows: 1,
          isCode: false,
        },
        field3: { type: "checkbox", defaultValue: { value: false } },
      });

      const { getElementAsHTML } = createEditorWithElements(
        { testElement },
        elementHTML
      );

      expect(getElementAsHTML()).toBe(trimHtml(elementHTML));
    });
  });

  describe("Conversion between data and Prosemirror node", () => {
    const elementHTML = `
          <testelement type="testElement" has-errors="false">
          <element-testelement-field1 class="ProsemirrorElement__testElement-field1"><p></p></element-testelement-field1>
          <element-testelement-field2 class="ProsemirrorElement__testElement-field2"></element-testelement-field2>
          <element-testelement-field3 class="ProsemirrorElement__testElement-field3" fields="{&quot;value&quot;:true}"></element-testelement-field3>
          </testelement>
        `;
    const testElement = createNoopElement({
      field1: { type: "richText" },
      field2: {
        type: "text",
        isMultiline: false,
        rows: 1,
      },
      field3: { type: "checkbox" },
    });
    const testElementValues = {
      field1: "<p></p>",
      field2: "",
      field3: { value: true },
    };

    describe("Conversion from data to node", () => {
      it("should produce an element node, given element data", () => {
        const { getNodeFromElement, view } = createEditorWithElements(
          { testElement },
          elementHTML
        );

        const node = getNodeFromElement(
          "testElement",
          testElementValues,
          view.state.schema
        );

        // We expect the node we've just manually created to match the node
        // that's been serialised from the defaults
        expect(node?.eq(view.state.doc.firstChild as Node)).toBe(true);
      });

      it("should not permit data that does not match an element", () => {
        const { getNodeFromElement, view } = createEditorWithElements(
          { testElement },
          elementHTML
        );

        getNodeFromElement(
          "testElement",
          // @ts-expect-error -- we should not be able to instantiate elements with non-element types
          { notAThing: "This doesn't look like an element" },
          view.state.schema
        );
      });
    });

    describe("Conversion from node to data", () => {
      it("should produce element data, given an element node", () => {
        const {
          getElementFromNode,
          view,
          serializer,
        } = createEditorWithElements({ testElement }, elementHTML);

        const element = getElementFromNode(
          view.state.doc.firstChild as Node,
          serializer
        );

        // We expect the node we've just manually created to match the node
        // that's been serialised from the defaults
        expect(element).toEqual(testElementValues);
      });

      it("should not produce data that does not match the element", () => {
        const {
          getElementFromNode,
          view,
          serializer,
        } = createEditorWithElements({ testElement }, elementHTML);

        const element = getElementFromNode(
          view.state.doc.firstChild as Node,
          serializer
        );

        element.field1;
        element.field2;
        element.field3;

        // @ts-expect-error -- we should not be able to access non-element properties
        element.notAField;
      });
    });
  });
});
