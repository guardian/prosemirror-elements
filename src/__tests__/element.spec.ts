import { buildElementPlugin } from "../element";
import type { CustomField } from "../types/Element";
import { createEditorWithElements, createNoopElement } from "./helpers";

describe("buildElementPlugin", () => {
  describe("Typesafety", () => {
    it("should allow consumers to instantiate elements", () => {
      const testElement = createNoopElement("testElement", {});
      const { insertElement } = buildElementPlugin([testElement]);
      insertElement("testElement", {});
    });

    it("should not allow consumers to instantiate elements that do not exist", () => {
      const testElement = createNoopElement("testElement", {});
      const { insertElement } = buildElementPlugin([testElement]);
      // @ts-expect-error -- we should not be able to insert a non-existent element
      insertElement("testElementThatDoesNotExist", {});
    });

    it("should allow consumers to instantiate elements with a partial set of initial fields", () => {
      const testElement = createNoopElement("testElement", {
        prop1: { type: "richText" },
        prop2: { type: "richText" },
      });
      const { insertElement } = buildElementPlugin([testElement]);
      insertElement("testElement", { prop1: "<p>Example initial state</p>" });
    });

    it("should allow consumers to instantiate custom elements", () => {
      const testElement = createNoopElement("testElement", {
        prop1: { type: "richText" },
        prop2: {
          type: "custom",
          defaultValue: { arbitraryValue: "hai" },
        } as CustomField<{ arbitraryValue: string }>,
      });
      const { insertElement } = buildElementPlugin([testElement]);
      insertElement("testElement", {
        prop1: "<p>Example initial state</p>",
        prop2: { arbitraryValue: "hai" },
      });
    });

    it("should not allow consumers to instantiate elements with fields that do not exist", () => {
      const testElement = createNoopElement("testElement", {
        prop1: { type: "richText" },
      });
      const { insertElement } = buildElementPlugin([testElement]);
      insertElement("testElement", {
        // @ts-expect-error -- we should not be able to insert a non-existent field
        propDoesNotExist: "<p>Example initial state</p>",
      });
    });

    it("should not allow fields to be instantiated with an incorrect type", () => {
      const testElement = createNoopElement("testElement", {
        prop1: { type: "checkbox", defaultValue: { value: false } },
      });
      const { insertElement } = buildElementPlugin([testElement]);
      insertElement("testElement", {
        prop1: { value: true },
      });
      insertElement("testElement", {
        // @ts-expect-error -- we should not be able to insert a field of the wrong type
        prop1: "This shouldn't typecheck",
      });
    });

    it("should not allow consumers to instantiate custom elements with an incorrect type", () => {
      const testElement = createNoopElement("testElement", {
        prop1: {
          type: "custom",
          defaultValue: { arbitraryValue: "hai" },
        } as CustomField<{ arbitraryValue: string }>,
      });
      const { insertElement } = buildElementPlugin([testElement]);
      insertElement("testElement", {
        // @ts-expect-error -- we should not be able to insert a custom field of the wrong type
        prop1: { doesNotExist: "hai" },
      });
    });
  });

  describe("Element creation", () => {
    it("should create an element with default content when no fields are supplied", () => {
      const testElement = createNoopElement("testElement", {
        prop1: { type: "checkbox", defaultValue: { value: false } },
        prop2: { type: "richText", defaultValue: "<p>Content</p>" },
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements([testElement]);

      insertElement("testElement")(view.state, view.dispatch);

      const expected =
        '<testelement type="testElement" has-errors="false"><element-testelement-prop1 class="ProsemirrorElement__testElement-prop1" fields="{&quot;value&quot;:false}"></element-testelement-prop1><div class="ProsemirrorElement__testElement-prop2"><p>Content</p></div></testelement>';
      expect(getElementAsHTML()).toBe(expected);
    });

    it("should fill out fields in ATTRIBUTE nodes", () => {
      const testElement = createNoopElement("testElement", {
        prop1: { type: "checkbox", defaultValue: { value: false } },
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements([testElement]);

      insertElement("testElement", { prop1: { value: true } })(
        view.state,
        view.dispatch
      );

      const expected =
        '<testelement type="testElement" has-errors="false"><element-testelement-prop1 class="ProsemirrorElement__testElement-prop1" fields="{&quot;value&quot;:true}"></element-testelement-prop1></testelement>';
      expect(getElementAsHTML()).toBe(expected);
    });

    it("should fill out content in CONTENT nodes", () => {
      const testElement = createNoopElement("testElement", {
        prop1: { type: "richText" },
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements([testElement]);

      insertElement("testElement", { prop1: "<p>Content</p>" })(
        view.state,
        view.dispatch
      );

      const expected =
        '<testelement type="testElement" has-errors="false"><div class="ProsemirrorElement__testElement-prop1"><p>Content</p></div></testelement>';
      expect(getElementAsHTML()).toBe(expected);
    });

    it("should allow partial fields", () => {
      const testElement = createNoopElement("testElement", {
        prop1: { type: "richText" },
        prop2: { type: "richText", defaultValue: "<p>Default</p>" },
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements([testElement]);

      insertElement("testElement", { prop1: "<p>Content</p>" })(
        view.state,
        view.dispatch
      );

      const expected =
        '<testelement type="testElement" has-errors="false"><div class="ProsemirrorElement__testElement-prop1"><p>Content</p></div><div class="ProsemirrorElement__testElement-prop2"><p>Default</p></div></testelement>';
      expect(getElementAsHTML()).toBe(expected);
    });

    it("should fill out all fields", () => {
      const testElement = createNoopElement("testElement", {
        prop1: { type: "richText" },
        prop2: { type: "richText" },
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements([testElement]);

      insertElement("testElement", {
        prop1: "<p>Content for prop1</p>",
        prop2: "<p>Content for prop2</p>",
      })(view.state, view.dispatch);

      const expected =
        '<testelement type="testElement" has-errors="false"><div class="ProsemirrorElement__testElement-prop1"><p>Content for prop1</p></div><div class="ProsemirrorElement__testElement-prop2"><p>Content for prop2</p></div></testelement>';
      expect(getElementAsHTML()).toBe(expected);
    });

    it("should fill out fields in custom nodes", () => {
      const testElement = createNoopElement("testElement", {
        prop1: {
          type: "custom",
          defaultValue: { arbitraryValue: "hai" },
        } as CustomField<{ arbitraryValue: string }>,
      });
      const {
        view,
        insertElement,
        getElementAsHTML,
      } = createEditorWithElements([testElement]);

      insertElement("testElement", { prop1: { arbitraryValue: "hai" } })(
        view.state,
        view.dispatch
      );

      const expected =
        '<testelement type="testElement" has-errors="false"><element-testelement-prop1 class="ProsemirrorElement__testElement-prop1" fields="{&quot;arbitraryValue&quot;:&quot;hai&quot;}"></element-testelement-prop1></testelement>';
      expect(getElementAsHTML()).toBe(expected);
    });
  });
});
