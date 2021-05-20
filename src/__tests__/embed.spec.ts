import { buildEmbedPlugin } from "../embed";
import { createEditorWithEmbeds, createNoopEmbed } from "./helpers";

describe("buildEmbedPlugin", () => {
  describe("Typesafety", () => {
    it("should allow consumers to instantiate embeds", () => {
      const testEmbed = createNoopEmbed("testEmbed", {});
      const { insertEmbed } = buildEmbedPlugin([testEmbed]);
      insertEmbed("testEmbed", {});
    });

    it("should not allow consumers to instantiate embeds that do not exist", () => {
      const testEmbed = createNoopEmbed("testEmbed", {});
      const { insertEmbed } = buildEmbedPlugin([testEmbed]);
      // @ts-expect-error -- we should not be able to insert a non-existent embed
      insertEmbed("testEmbedThatDoesNotExist", {});
    });

    it("should allow consumers to instantiate embeds with a partial set of initial fields", () => {
      const testEmbed = createNoopEmbed("testEmbed", {
        prop1: { type: "richText" },
        prop2: { type: "richText" },
      });
      const { insertEmbed } = buildEmbedPlugin([testEmbed]);
      insertEmbed("testEmbed", { prop1: "<p>Example initial state</p>" });
    });

    it("should not allow consumers to instantiate embeds with fields that do not exist", () => {
      const testEmbed = createNoopEmbed("testEmbed", {
        prop1: { type: "richText" },
      });
      const { insertEmbed } = buildEmbedPlugin([testEmbed]);
      insertEmbed("testEmbed", {
        // @ts-expect-error -- we should not be able to insert a non-existent field
        propDoesNotExist: "<p>Example initial state</p>",
      });
    });

    it("should not allow fields to be instantiated with an incorrect type", () => {
      const testEmbed = createNoopEmbed("testEmbed", {
        prop1: { type: "checkbox", defaultValue: { value: false } },
      });
      const { insertEmbed } = buildEmbedPlugin([testEmbed]);
      insertEmbed("testEmbed", {
        prop1: { value: true },
      });
      insertEmbed("testEmbed", {
        // @ts-expect-error -- we should not be able to insert a non-existent field
        prop1: "This shouldn't typecheck",
      });
    });
  });

  describe("Embed creation", () => {
    it("should create an embed with default content when no fields are supplied", () => {
      const testEmbed = createNoopEmbed("testEmbed", {
        prop1: { type: "checkbox", defaultValue: { value: false } },
        prop2: { type: "richText", defaultValue: "<p>Content</p>" },
      });
      const { view, insertEmbed, getEmbedAsHTML } = createEditorWithEmbeds([
        testEmbed,
      ]);

      insertEmbed("testEmbed")(view.state, view.dispatch);

      const expected =
        '<testembed type="testEmbed" has-errors="false"><embed-testembed-prop1 class="ProsemirrorEmbed__testEmbed-prop1" fields="{&quot;value&quot;:false}"></embed-testembed-prop1><div class="ProsemirrorEmbed__testEmbed-prop2"><p>Content</p></div></testembed>';
      expect(getEmbedAsHTML()).toBe(expected);
    });

    it("should fill out fields in ATTRIBUTE nodes", () => {
      const testEmbed = createNoopEmbed("testEmbed", {
        prop1: { type: "checkbox", defaultValue: { value: false } },
      });
      const { view, insertEmbed, getEmbedAsHTML } = createEditorWithEmbeds([
        testEmbed,
      ]);

      insertEmbed("testEmbed", { prop1: { value: true } })(
        view.state,
        view.dispatch
      );

      const expected =
        '<testembed type="testEmbed" has-errors="false"><embed-testembed-prop1 class="ProsemirrorEmbed__testEmbed-prop1" fields="{&quot;value&quot;:true}"></embed-testembed-prop1></testembed>';
      expect(getEmbedAsHTML()).toBe(expected);
    });

    it("should fill out content in CONTENT nodes", () => {
      const testEmbed = createNoopEmbed("testEmbed", {
        prop1: { type: "richText" },
      });
      const { view, insertEmbed, getEmbedAsHTML } = createEditorWithEmbeds([
        testEmbed,
      ]);

      insertEmbed("testEmbed", { prop1: "<p>Content</p>" })(
        view.state,
        view.dispatch
      );

      const expected =
        '<testembed type="testEmbed" has-errors="false"><div class="ProsemirrorEmbed__testEmbed-prop1"><p>Content</p></div></testembed>';
      expect(getEmbedAsHTML()).toBe(expected);
    });

    it("should allow partial fields", () => {
      const testEmbed = createNoopEmbed("testEmbed", {
        prop1: { type: "richText" },
        prop2: { type: "richText", defaultValue: "<p>Default</p>" },
      });
      const { view, insertEmbed, getEmbedAsHTML } = createEditorWithEmbeds([
        testEmbed,
      ]);

      insertEmbed("testEmbed", { prop1: "<p>Content</p>" })(
        view.state,
        view.dispatch
      );

      const expected =
        '<testembed type="testEmbed" has-errors="false"><div class="ProsemirrorEmbed__testEmbed-prop1"><p>Content</p></div><div class="ProsemirrorEmbed__testEmbed-prop2"><p>Default</p></div></testembed>';
      expect(getEmbedAsHTML()).toBe(expected);
    });

    it("should fill out all fields", () => {
      const testEmbed = createNoopEmbed("testEmbed", {
        prop1: { type: "richText" },
        prop2: { type: "richText" },
      });
      const { view, insertEmbed, getEmbedAsHTML } = createEditorWithEmbeds([
        testEmbed,
      ]);

      insertEmbed("testEmbed", {
        prop1: "<p>Content for prop1</p>",
        prop2: "<p>Content for prop2</p>",
      })(view.state, view.dispatch);

      const expected =
        '<testembed type="testEmbed" has-errors="false"><div class="ProsemirrorEmbed__testEmbed-prop1"><p>Content for prop1</p></div><div class="ProsemirrorEmbed__testEmbed-prop2"><p>Content for prop2</p></div></testembed>';
      expect(getEmbedAsHTML()).toBe(expected);
    });
  });
});
