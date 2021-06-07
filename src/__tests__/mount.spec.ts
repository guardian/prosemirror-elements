import { buildEmbedPlugin } from "../embed";
import { createEmbedSpec } from "../embedSpec";
import { createNoopEmbed } from "./helpers";

describe("mount", () => {
  describe("nodeView typesafety", () => {
    it("should provide typesafe nodeView to its consumer", () => {
      const fieldSpec = {
        prop1: {
          type: "richText",
        },
      } as const;
      createEmbedSpec(
        "testEmbed",
        fieldSpec,
        () => () => null,
        (_, __, ___, fieldNodeViews) => {
          // Prop1 is derived from the fieldSpec
          fieldNodeViews.prop1;
        },
        () => null,
        { prop1: "text" }
      );
    });

    it("should not typecheck when props are not provided", () => {
      const fieldSpec = {
        notProp1: {
          type: "richText",
        },
      } as const;
      createEmbedSpec(
        "testEmbed",
        fieldSpec,
        () => () => null,
        (_, __, ___, fieldNodeViews) => {
          // @ts-expect-error – prop1 is not available on this object,
          // as it is not defined in `fieldSpec` passed into `mount`
          fieldNodeViews.prop1;
        },
        () => null,
        { notProp1: "text" }
      );
    });
  });

  describe("field typesafety", () => {
    it("should provide typesafe fields to its consumer", () => {
      const fieldSpec = {
        prop1: {
          type: "richText",
        },
        prop2: {
          type: "checkbox",
          defaultValue: { value: true },
        },
      } as const;
      createEmbedSpec(
        "testEmbed",
        fieldSpec,
        () => () => null,
        (fields) => {
          // Prop1 is derived from the fieldSpec, and is a string b/c it's a richText field
          fields.prop1.toString();
          // Prop2 is a boolean b/c it's a checkbox field
          fields.prop2.value.valueOf();
        },
        () => null,
        { prop1: "text" }
      );
    });

    it("should not typecheck when props are not provided", () => {
      const fieldSpec = {
        notProp1: {
          type: "richText",
        },
      } as const;
      createEmbedSpec(
        "testEmbed",
        fieldSpec,
        () => () => null,
        (fields) => {
          // @ts-expect-error – prop1 is not available on this object,
          // as it is not defined in `fieldSpec` passed into `mount`
          fields.doesNotExist;
        },
        () => null,
        { notProp1: "text" }
      );
    });
  });

  describe("nodeSpec generation", () => {
    it("should create an nodeSpec with no nodes when the spec is empty", () => {
      const { nodeSpec } = buildEmbedPlugin([]);
      expect(nodeSpec.size).toBe(0);
    });

    it("should create an nodeSpec with a parent node for each embed", () => {
      const testEmbed1 = createNoopEmbed("testEmbed1", {});
      const testEmbed2 = createNoopEmbed("testEmbed2", {});
      const { nodeSpec } = buildEmbedPlugin([testEmbed1, testEmbed2]);
      expect(nodeSpec.size).toBe(2);
      expect(nodeSpec.get("testEmbed1")).toMatchObject({ content: "" });
      expect(nodeSpec.get("testEmbed2")).toMatchObject({ content: "" });
    });

    it("should create child nodes for each embed prop, and the parent node should include them in its content expression", () => {
      const testEmbed1 = createNoopEmbed("testEmbed1", {
        prop1: {
          type: "richText",
        },
        prop2: {
          type: "richText",
        },
      });
      const { nodeSpec } = buildEmbedPlugin([testEmbed1]);
      expect(nodeSpec.get("testEmbed1")).toMatchObject({
        content: "prop1 prop2",
      });
      expect(nodeSpec.get("prop1")).toMatchObject({ content: "paragraph" });
      expect(nodeSpec.get("prop2")).toMatchObject({ content: "paragraph" });
    });

    describe("fields", () => {
      describe("richText", () => {
        it("should allow the user to specify custom toDOM and parseDOM properties on richText props", () => {
          const fieldSpec = {
            prop1: {
              type: "richText" as const,
              content: "text",
              toDOM: () => "div",
              parseDOM: [{ tag: "header" }],
            },
          };

          const testEmbed1 = createNoopEmbed("testEmbed1", fieldSpec);
          const { nodeSpec } = buildEmbedPlugin([testEmbed1]);
          expect(nodeSpec.get("prop1")).toEqual({
            content: fieldSpec.prop1.content,
            toDOM: fieldSpec.prop1.toDOM,
            parseDOM: fieldSpec.prop1.parseDOM,
          });
        });
      });

      describe("checkbox", () => {
        it("should specify the appropriate fields on checkbox props", () => {
          const fieldSpec = {
            prop1: {
              type: "checkbox" as const,
              defaultValue: { value: true },
            },
          };

          const testEmbed1 = createNoopEmbed("testEmbed1", fieldSpec);
          const { nodeSpec } = buildEmbedPlugin([testEmbed1]);
          expect(nodeSpec.get("prop1")).toMatchObject({
            atom: true,
            attrs: {
              fields: {
                default: {
                  value: {
                    value: true,
                  },
                },
              },
            },
          });
        });
      });
    });
  });
});
