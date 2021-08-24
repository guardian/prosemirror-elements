import type { Node } from "prosemirror-model";
import { buildElementPlugin } from "../element";
import { createElementSpec } from "../elementSpec";
import type { CustomFieldDescription } from "../fieldViews/CustomFieldView";
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
      insertElement({ elementName: "testElement", values: {} });
    });

    it("should allow consumers to instantiate multiple elements", () => {
      const testElement = createNoopElement({});
      const testElement2 = createNoopElement({});
      const { insertElement } = buildElementPlugin({
        testElement,
        testElement2,
      });
      insertElement({ elementName: "testElement", values: {} });
      insertElement({ elementName: "testElement2", values: {} });
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
      insertElement({
        elementName: "testElement",
        values: { field1: "<p>Example initial state</p>" },
      });
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
      insertElement({
        elementName: "testElement2",
        values: { field2: "<p>Example initial state</p>" },
      });
    });

    it("should allow consumers to instantiate custom elements", () => {
      const testElement = createNoopElement({
        field1: { type: "richText" },
        field2: {
          type: "custom",
          defaultValue: { arbitraryValue: "hai" },
        } as CustomFieldDescription<{ arbitraryValue: string }>,
      });
      const { insertElement } = buildElementPlugin({ testElement });
      insertElement({
        elementName: "testElement",
        values: {
          field1: "<p>Example initial state</p>",
          field2: { arbitraryValue: "hai" },
        },
      });
    });

    it("should allow consumers to instantiate custom elements with custom props", () => {
      const noop = () => {
        return;
      };

      const createFieldDescriptions = (callback: () => void) => {
        return {
          field1: { type: "richText" },
          field2: {
            type: "custom",
            defaultValue: { arbitraryValue: "hai" },
            props: {
              callback,
            },
          } as CustomFieldDescription<
            { arbitraryValue: string },
            { callback: () => void }
          >,
        } as const;
      };

      const testElement = createNoopElement(createFieldDescriptions(noop));

      const { insertElement } = buildElementPlugin({ testElement });
      insertElement({
        elementName: "testElement",
        values: {
          field1: "<p>Example initial state</p>",
          field2: { arbitraryValue: "hai" },
        },
      });
    });

    it("should not allow consumers to instantiate elements with fields that do not exist", () => {
      const testElement = createNoopElement({
        field1: { type: "richText" },
      });
      const { insertElement } = buildElementPlugin({ testElement });
      insertElement({
        elementName: "testElement",
        values: {
          // @ts-expect-error -- we should not be able to insert a non-existent field
          propDoesNotExist: "<p>Example initial state</p>",
        },
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
      insertElement({
        elementName: "testElement2",
        values: {
          // @ts-expect-error -- we should not be able to insert a non-existent field
          propDoesNotExist: "<p>Example initial state</p>",
        },
      });
    });

    it("should not allow fields to be instantiated with an incorrect type", () => {
      const testElement = createNoopElement({
        field1: { type: "checkbox", defaultValue: false },
      });
      const { insertElement } = buildElementPlugin({ testElement });
      insertElement({
        elementName: "testElement",
        values: {
          field1: true,
        },
      });
      insertElement({
        elementName: "testElement",
        values: {
          // @ts-expect-error -- we should not be able to insert a field of the wrong type
          field1: "This shouldn't typecheck",
        },
      });
    });

    it("should not allow consumers to instantiate custom elements with an incorrect type", () => {
      const testElement = createNoopElement({
        field1: {
          type: "custom",
          defaultValue: { arbitraryValue: "hai" },
        } as CustomFieldDescription<{ arbitraryValue: string }>,
      });
      const { insertElement } = buildElementPlugin({ testElement });
      insertElement({
        elementName: "testElement",
        values: {
          // @ts-expect-error -- we should not be able to insert a custom field of the wrong type
          field1: { doesNotExist: "hai" },
        },
      });
    });
  });

  describe("Element creation and serialisation", () => {
    it("should create an element with default content when no fields are supplied", () => {
      const testElement = createNoopElement({
        field1: { type: "checkbox", defaultValue: false },
        field2: { type: "richText", defaultValue: "<p>Content</p>" },
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements({ testElement });

      insertElement({ elementName: "testElement", values: {} })(
        view.state,
        view.dispatch
      );

      const expected = trimHtml(`
        <div pm-elements-element-type="testElement" has-errors="false">
          <div pm-elements-field-name="testElement_field1" fields="false"></div>
          <div pm-elements-field-name="testElement_field2"><p>Content</p></div>
        </div>`);
      expect(getElementAsHTML()).toBe(expected);
    });

    it("should fill out fields in ATTRIBUTE nodes", () => {
      const testElement = createNoopElement({
        field1: { type: "checkbox", defaultValue: false },
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements({ testElement });

      insertElement({
        elementName: "testElement",
        values: { field1: true },
      })(view.state, view.dispatch);

      const expected = trimHtml(`
        <div pm-elements-element-type="testElement" has-errors="false">
          <div pm-elements-field-name="testElement_field1" fields="true"></div>
        </div>`);
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

      insertElement({
        elementName: "testElement",
        values: { field1: "<p>Content</p>" },
      })(view.state, view.dispatch);

      const expected = trimHtml(`
        <div pm-elements-element-type="testElement" has-errors="false">
          <div pm-elements-field-name="testElement_field1"><p>Content</p></div>
        </div>`);
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

      insertElement({
        elementName: "testElement",
        values: {
          field1: "<p>Content for field1</p>",
          field2: "<p>Content for field2</p>",
        },
      })(view.state, view.dispatch);

      const expected = trimHtml(`
        <div pm-elements-element-type="testElement" has-errors="false">
          <div pm-elements-field-name="testElement_field1"><p>Content for field1</p></div>
          <div pm-elements-field-name="testElement_field2"><p>Content for field2</p></div>
        </div>`);
      expect(getElementAsHTML()).toBe(expected);
    });

    it("should fill out fields in custom nodes", () => {
      const testElement = createNoopElement({
        field1: {
          type: "custom",
          defaultValue: { arbitraryValue: "hai" },
        } as CustomFieldDescription<{ arbitraryValue: string }>,
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements({ testElement });

      insertElement({
        elementName: "testElement",
        values: { field1: { arbitraryValue: "hai" } },
      })(view.state, view.dispatch);

      const expected = trimHtml(`
        <div pm-elements-element-type="testElement" has-errors="false">
          <div pm-elements-field-name="testElement_field1" fields="{&quot;arbitraryValue&quot;:&quot;hai&quot;}"></div>
        </div>`);
      expect(getElementAsHTML()).toBe(expected);
    });
  });

  describe("Serialisation/deserialisation", () => {
    const testElementHTML = `
          <div pm-elements-element-type="testElement" has-errors="false">
          <div pm-elements-field-name="testElement_field1"><p></p></div>
          <div pm-elements-field-name="testElement_field2"></div>
          <div pm-elements-field-name="testElement_field3" fields="true"></div>
          </div>
        `;

    const testElement2HTML = `
        <div pm-elements-element-type="testElement2" has-errors="false">
        <div pm-elements-field-name="testElement_field4"><p></p></div>
        <div pm-elements-field-name="testElement_field5"></div>
        </div2>
      `;

    const testElementTransformHTML = `
      <div pm-elements-element-type="testElementWithTransform" has-errors="false">
      <element-testelementwithtransform-field1 pm-elements-field-name="testElement_field1"><p></p></element-testelementwithtransform-field1>
      </div2>
    `;

    const testElement = createNoopElement({
      field1: { type: "richText" },
      field2: {
        type: "text",
        isMultiline: false,
        rows: 1,
        isCode: false,
      },
      field3: { type: "checkbox" },
    });

    const testElement2 = createNoopElement({
      field4: { type: "richText" },
      field5: {
        type: "text",
        isMultiline: false,
        rows: 1,
        isCode: false,
      },
    });

    type ExternalData = { nestedElementValues: { field1: string } };
    type OtherExternalData = { otherValues: { field1: string } };

    const testElementWithTransform = createElementSpec(
      {
        field1: { type: "richText" },
      },
      () => null,
      () => null,
      {
        transformElementDataIn: (external: ExternalData) => {
          return external.nestedElementValues;
        },
        transformElementDataOut: (internal): ExternalData => {
          return {
            nestedElementValues: internal,
          };
        },
      }
    );

    const testElementWithTransform2 = createElementSpec(
      {
        field1: { type: "richText" },
      },
      () => null,
      () => null,
      {
        transformElementDataIn: (external: OtherExternalData) => {
          return external.otherValues;
        },
        transformElementDataOut: (internal): OtherExternalData => {
          return {
            otherValues: internal,
          };
        },
      }
    );

    const testElementValues = {
      elementName: "testElement",
      values: {
        field1: "<p></p>",
        field2: "",
        field3: true,
      },
    } as const;

    const testElement2Values = {
      elementName: "testElement2",
      values: {
        field4: "<p></p>",
        field5: "",
      },
    } as const;

    describe("Element parsing", () => {
      it("should parse fields of all types, respecting values against defaults", () => {
        const elementHTML = `
          <div pm-elements-element-type="testElement" has-errors="false">
          <div pm-elements-field-name="testElement_field1"><p>Content</p></div>
          <div pm-elements-field-name="testElement_field2">Content</div>
          <div pm-elements-field-name="testElement_field3" fields="true"></div>
          </div>
        `;

        const { getElementAsHTML } = createEditorWithElements(
          { testElement },
          elementHTML
        );

        expect(getElementAsHTML()).toBe(trimHtml(elementHTML));
      });

      it("should parse fields of all types, handling empty content values correctly", () => {
        const elementHTML = `
          <div pm-elements-element-type="testElement" has-errors="false">
          <div pm-elements-field-name="testElement_field1"><p></p></div>
          <div pm-elements-field-name="testElement_field2"></div>
          <div pm-elements-field-name="testElement_field3" fields="true"></div>
          </div>
        `;

        const { getElementAsHTML } = createEditorWithElements(
          { testElement },
          elementHTML
        );

        expect(getElementAsHTML()).toBe(trimHtml(elementHTML));
      });
    });

    describe("Conversion between data and Prosemirror node", () => {
      describe("Conversion from data to node", () => {
        it("should produce an element node, given element data", () => {
          const { getNodeFromElementData, view } = createEditorWithElements(
            { testElement, testElement2 },
            testElementHTML
          );

          const node = getNodeFromElementData(
            testElementValues,
            view.state.schema
          );

          // We expect the node we've just manually created to match the node
          // that's been serialised from the defaults
          expect(node?.eq(view.state.doc.firstChild as Node)).toBe(true);
        });

        it("should return undefined if the element does not exist in the element map", () => {
          const { getNodeFromElementData, view } = createEditorWithElements(
            { testElement, testElement2 },
            testElementHTML
          );

          const node = getNodeFromElementData(
            { elementName: "thisIsNotAnElement", values: {} },
            view.state.schema
          );

          // We expect the node we've just manually created to match the node
          // that's been serialised from the defaults
          expect(node).toBe(undefined);
        });

        it("should transform data with the provided transformer", () => {
          const { getNodeFromElementData, view } = createEditorWithElements(
            {
              testElementWithTransform,
              testElementWithTransform2,
            },
            testElementTransformHTML
          );

          const node = getNodeFromElementData(
            {
              elementName: "testElementWithTransform",
              values: { nestedElementValues: { field1: "<p></p>" } },
            },
            view.state.schema
          );

          expect(node?.eq(view.state.doc.firstChild as Node)).toBe(true);
        });
      });

      describe("Conversion from node to data", () => {
        it("should produce element data, given an element node", () => {
          const {
            getElementDataFromNode,
            view,
            serializer,
          } = createEditorWithElements({ testElement }, testElementHTML);

          const element = getElementDataFromNode(
            view.state.doc.firstChild as Node,
            serializer
          );

          // We expect the node we've just manually created to match the node
          // that's been serialised from the defaults
          expect(element).toEqual(testElementValues);
        });

        it("should return undefined, given an non-element node", () => {
          const {
            getElementDataFromNode,
            view,
            serializer,
          } = createEditorWithElements({ testElement });

          const element = getElementDataFromNode(
            view.state.doc.content.firstChild as Node,
            serializer
          );

          // We expect the node we've just manually created to match the node
          // that's been serialised from the defaults
          expect(element).toEqual(undefined);
        });

        it("should produce element data, given an element node, with multiple elements", () => {
          const {
            getElementDataFromNode,
            view,
            serializer,
          } = createEditorWithElements(
            { testElement, testElement2 },
            testElement2HTML
          );

          const element = getElementDataFromNode(
            view.state.doc.firstChild as Node,
            serializer
          );

          expect(element).toEqual(testElement2Values);
        });

        it("should not produce data that does not match the element", () => {
          const {
            getElementDataFromNode,
            view,
            serializer,
          } = createEditorWithElements(
            { testElement, testElement2 },
            testElementHTML
          );

          const element = getElementDataFromNode(
            view.state.doc.firstChild as Node,
            serializer
          );

          // Type refinement should work on each element
          if (element?.elementName === "testElement") {
            element.values.field1;
            element.values.field2;
            element.values.field3;
            // @ts-expect-error -- we should not be able to access properties not on a specific element
            element.values.field4;
          }

          if (element?.elementName === "testElement2") {
            element.values.field4;
            element.values.field5;
          }

          // @ts-expect-error -- we should not be able to access non-element properties
          element.notAField;
        });

        it("should transform data with the provided transformer", () => {
          const {
            getElementDataFromNode,
            view,
            serializer,
          } = createEditorWithElements(
            {
              testElementWithTransform,
              testElementWithTransform2,
            },
            testElementTransformHTML
          );

          const element = getElementDataFromNode(
            view.state.doc.firstChild as Node,
            serializer
          );

          expect(element).toEqual({
            elementName: "testElementWithTransform",
            values: {
              nestedElementValues: { field1: "<p></p>" },
            },
          });
        });

        it("should be typesafe with transformed data", () => {
          const {
            getElementDataFromNode,
            view,
            serializer,
          } = createEditorWithElements(
            {
              testElementWithTransform,
              testElementWithTransform2,
            },
            testElementTransformHTML
          );

          const element = getElementDataFromNode(
            view.state.doc.firstChild as Node,
            serializer
          );

          if (element?.elementName === "testElementWithTransform") {
            element.values.nestedElementValues.field1;
            // @ts-expect-error -- we should not be able to access properties not on a specific element
            element.values.otherValues;
          }

          if (element?.elementName === "testElementWithTransform2") {
            element.values.otherValues.field1;
            // @ts-expect-error -- we should not be able to access properties not on a specific element
            element.values.nestedElementValues;
          }
        });
      });
    });
  });
});
