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
        <div pme-element-type="testElement">
          <div pme-field-name="testElement__field1" fields="false"></div>
          <div pme-field-name="testElement__field2"><p>Content</p></div>
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
        <div pme-element-type="testElement">
          <div pme-field-name="testElement__field1" fields="true"></div>
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
        <div pme-element-type="testElement">
          <div pme-field-name="testElement__field1"><p>Content</p></div>
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
        <div pme-element-type="testElement">
          <div pme-field-name="testElement__field1"><p>Content for field1</p></div>
          <div pme-field-name="testElement__field2"><p>Content for field2</p></div>
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
        <div pme-element-type="testElement">
          <div pme-field-name="testElement__field1" fields="{&quot;arbitraryValue&quot;:&quot;hai&quot;}"></div>
        </div>`);
      expect(getElementAsHTML()).toBe(expected);
    });

    it("should convert underscores into hyphens when representing elements as nodes", () => {
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
      } = createEditorWithElements({ "test-element": testElement });

      insertElement({
        elementName: "test-element",
        values: { field1: { arbitraryValue: "hai" } },
      })(view.state, view.dispatch);

      const expected = trimHtml(`
        <div pme-element-type="test_element">
          <div pme-field-name="test_element__field1" fields="{&quot;arbitraryValue&quot;:&quot;hai&quot;}"></div>
        </div>`);
      expect(getElementAsHTML()).toBe(expected);
    });
  });

  describe("Serialisation/deserialisation", () => {
    const testElementHTML = `
          <div pme-element-type="testElement">
          <div pme-field-name="testElement__field1"><p></p></div>
          <div pme-field-name="testElement__field2"></div>
          <div pme-field-name="testElement__field3" fields="true"></div>
          </div>
        `;

    const testElement2HTML = `
        <div pme-element-type="testElement2">
        <div pme-field-name="testElement__field4"><p></p></div>
        <div pme-field-name="testElement__field5"></div>
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

    const testElementWithValidation = createElementSpec(
      {
        field1: { type: "richText" },
      },
      () => undefined,
      () => ({ field1: [{ error: "Some error", message: "", level: "ERROR" }] })
    );

    const testElementWithDifferentValidation = createElementSpec(
      {
        checkbox: { type: "checkbox" },
      },
      () => undefined,
      () => ({
        checkbox: [
          {
            error: "Some other error",
            message: "A human readable message",
            level: "ERROR",
          },
        ],
      })
    );

    const elementWithAbsentOn = createNoopElement({
      field1: { type: "richText", absentOnEmpty: true },
      field2: {
        type: "text",
        absentOnEmpty: true,
        isMultiline: false,
        rows: 1,
        isCode: false,
      },
    });

    const testElementValues = {
      elementName: "testElement",
      errors: undefined,
      values: {
        field1: "<p></p>",
        field2: "",
        field3: true,
      },
    } as const;

    const testElement2Values = {
      elementName: "testElement2",
      errors: undefined,
      values: {
        field4: "<p></p>",
        field5: "",
      },
    } as const;

    describe("Element parsing", () => {
      it("should parse fields of all types, respecting values against defaults", () => {
        const elementHTML = `
          <div pme-element-type="testElement">
          <div pme-field-name="testElement__field1"><p>Content</p></div>
          <div pme-field-name="testElement__field2">Content</div>
          <div pme-field-name="testElement__field3" fields="true"></div>
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
          <div pme-element-type="testElement">
          <div pme-field-name="testElement__field1"><p></p></div>
          <div pme-field-name="testElement__field2"></div>
          <div pme-field-name="testElement__field3" fields="true"></div>
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

        it("should not retain HTML chars in rich text", () => {
          const { getNodeFromElementData, view } = createEditorWithElements({
            testElement,
          });

          const fieldText = "<html></html>";

          const node = getNodeFromElementData(
            { elementName: "testElement", values: { field1: fieldText } },
            view.state.schema
          );

          expect(node?.textContent).toBe("");
        });

        it("should retain HTML chars in plain text", () => {
          const { getNodeFromElementData, view } = createEditorWithElements({
            testElement,
          });

          const fieldText = "<html></html>";

          const node = getNodeFromElementData(
            { elementName: "testElement", values: { field2: fieldText } },
            view.state.schema
          );

          expect(node?.textContent).toBe(fieldText);
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

        it("should escape HTML chars in rich text", () => {
          const {
            getElementDataFromNode,
            insertElement,
            view,
            serializer,
          } = createEditorWithElements({ testElement });

          insertElement({
            elementName: "testElement",
            values: { field1: "<p>><</p>" },
          })(view.state, view.dispatch);

          const element = getElementDataFromNode(
            view.state.doc.firstChild as Node,
            serializer
          );

          expect(element?.values.field1).toEqual("<p>&gt;&lt;</p>");
        });

        it("should not escape HTML chars in plain text", () => {
          const {
            getElementDataFromNode,
            insertElement,
            view,
            serializer,
          } = createEditorWithElements({ testElement });

          insertElement({
            elementName: "testElement",
            values: { field2: "<>" },
          })(view.state, view.dispatch);

          const element = getElementDataFromNode(
            view.state.doc.firstChild as Node,
            serializer
          );

          expect(element?.values.field2).toEqual("<>");
        });

        it("should not output keys that match the field's `absentOn` value if they are empty", () => {
          const {
            getElementDataFromNode,
            insertElement,
            view,
            serializer,
          } = createEditorWithElements({ elementWithAbsentOn });

          insertElement({
            elementName: "elementWithAbsentOn",
            values: {
              field1: "",
              field2: "",
            },
          })(view.state, view.dispatch);

          const element = getElementDataFromNode(
            view.state.doc.firstChild as Node,
            serializer
          );

          expect(element).toEqual({
            elementName: "elementWithAbsentOn",
            values: {},
          });
        });

        it("should output keys that match the field's `absentOn` value if they have content", () => {
          const {
            getElementDataFromNode,
            insertElement,
            view,
            serializer,
          } = createEditorWithElements({ elementWithAbsentOn });

          insertElement({
            elementName: "elementWithAbsentOn",
            values: {
              field1: "<p>Content</p>",
              field2: "Content",
            },
          })(view.state, view.dispatch);

          const element = getElementDataFromNode(
            view.state.doc.firstChild as Node,
            serializer
          );

          expect(element).toEqual({
            elementName: "elementWithAbsentOn",
            values: {
              field1: "<p>Content</p>",
              field2: "Content",
            },
          });
        });

        it("should make keys with `absentOn` optional in the output type", () => {
          const {
            getElementDataFromNode,
            insertElement,
            view,
            serializer,
          } = createEditorWithElements({ elementWithAbsentOn });

          insertElement({
            elementName: "elementWithAbsentOn",
            values: {},
          })(view.state, view.dispatch);

          const element = getElementDataFromNode(
            view.state.doc.firstChild as Node,
            serializer
          );

          if (element) {
            try {
              // @ts-expect-error -- this field should be optional
              element.values.field1.toString();
              // @ts-expect-error -- this field should be optional
              element.values.field2.toString();
            } catch (e) {
              // We expect to fail here
            }
          }
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

        describe("validateElementData", () => {
          it("should output found errors", () => {
            const { validateElementData } = createEditorWithElements({
              testElementWithValidation,
              testElementWithDifferentValidation,
            });

            const errors = validateElementData({
              elementName: "testElementWithValidation",
              values: {
                field1: "Some text",
              },
            });

            expect(errors).toEqual({
              field1: [{ error: "Some error", message: "", level: "ERROR" }],
            });

            const otherErrors = validateElementData({
              elementName: "testElementWithDifferentValidation",
              values: { checkbox: true },
            });

            expect(otherErrors).toEqual({
              checkbox: [
                {
                  error: "Some other error",
                  message: "A human readable message",
                  level: "ERROR",
                },
              ],
            });
          });

          it("should output undefined if there are no errors", () => {
            const { validateElementData } = createEditorWithElements({
              testElement,
            });

            const errors = validateElementData({
              elementName: "testElement",
              values: testElementValues.values,
            });

            expect(errors).toEqual(undefined);
          });

          it("should not allow values which don't match the element", () => {
            const { validateElementData } = createEditorWithElements({
              testElement,
            });

            // @ts-expect-error -- values need to match the expected shape
            const errors = validateElementData("testElement", { a: 123 });

            expect(errors).toEqual(undefined);
          });

          it("should not allow non-existent elements", () => {
            const { validateElementData } = createEditorWithElements({
              testElement,
            });
            validateElementData({
              // @ts-expect-error -- we should not be able to check a non-existent element
              elementName: "non-existing-element",
              values: testElementValues.values,
            });
          });

          it("should accept the getElementDataFromNode output", () => {
            const {
              insertElement,
              getElementDataFromNode,
              validateElementData,
              view,
              serializer,
            } = createEditorWithElements({
              testElementWithValidation,
              testElementWithDifferentValidation,
            });

            const elementName = "testElementWithValidation";

            insertElement({
              elementName,
              values: { field1: "Some text" },
            })(view.state, view.dispatch);

            const errors = validateElementData(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion  -- We know this exists for the purposes of the test
              getElementDataFromNode(
                view.state.doc.firstChild as Node,
                serializer
              )!
            );

            expect(errors).toEqual({
              field1: [{ error: "Some error", message: "", level: "ERROR" }],
            });
          });
        });
      });
    });
  });
});
