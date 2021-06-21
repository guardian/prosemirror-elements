import { buildElementPlugin } from "../element";
import { createElementSpec } from "../elementSpec";
import type { CustomField } from "../types/Element";
import { createNoopElement } from "./helpers";

describe("mount", () => {
  describe("fieldView typesafety", () => {
    it("should provide typesafe fieldView to its consumer", () => {
      const fieldSpec = {
        prop1: {
          type: "richText",
        },
      } as const;
      createElementSpec(
        "testElement",
        fieldSpec,
        (_, __, fieldViews) => {
          // Prop1 is derived from the fieldSpec
          fieldViews.prop1;
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
      createElementSpec(
        "testElement",
        fieldSpec,
        (_, __, fieldViews) => {
          // @ts-expect-error – prop1 is not available on this object,
          // as it is not defined in `fieldSpec` passed into `mount`
          fieldViews.prop1;
        },
        () => null,
        { notProp1: "text" }
      );
    });
  });

  describe("validator typesafety", () => {
    it("should provide typesafe fields to its validator", () => {
      const fieldSpec = {
        prop1: {
          type: "richText",
        },
        prop2: {
          type: "checkbox",
          defaultValue: { value: true },
        },
      } as const;
      createElementSpec(
        "testElement",
        fieldSpec,
        () => () => undefined,
        (fields) => {
          // Prop1 is derived from the fieldSpec, and is a string b/c it's a richText field
          fields.prop1.toString();
          // Prop2 is a boolean b/c it's a checkbox field
          fields.prop2.value.valueOf();
          return null;
        },
        { prop1: "text" }
      );
    });

    it("should not typecheck when props are not provided", () => {
      const fieldSpec = {
        notProp1: {
          type: "richText",
        },
      } as const;
      createElementSpec(
        "testElement",
        fieldSpec,
        () => () => undefined,
        (fields) => {
          // @ts-expect-error – prop1 is not available on this object,
          // as it is not defined in `fieldSpec` passed into `mount`
          fields.doesNotExist;
          return null;
        },
        { notProp1: "text" }
      );
    });
  });

  describe("nodeSpec generation", () => {
    it("should create an nodeSpec with no nodes when the spec is empty", () => {
      const { nodeSpec } = buildElementPlugin([]);
      expect(nodeSpec.size).toBe(0);
    });

    it("should create an nodeSpec with a parent node for each element", () => {
      const testElement1 = createNoopElement("testElement1", {});
      const testElement2 = createNoopElement("testElement2", {});
      const { nodeSpec } = buildElementPlugin([testElement1, testElement2]);
      expect(nodeSpec.size).toBe(2);
      expect(nodeSpec.get("testElement1")).toMatchObject({ content: "" });
      expect(nodeSpec.get("testElement2")).toMatchObject({ content: "" });
    });

    it("should create child nodes for each element prop, and the parent node should include them in its content expression", () => {
      const testElement1 = createNoopElement("testElement1", {
        prop1: {
          type: "richText",
        },
        prop2: {
          type: "richText",
        },
      });
      const { nodeSpec } = buildElementPlugin([testElement1]);
      expect(nodeSpec.get("testElement1")).toMatchObject({
        content: "prop1 prop2",
      });
      expect(nodeSpec.get("prop1")).toMatchObject({ content: "paragraph+" });
      expect(nodeSpec.get("prop2")).toMatchObject({ content: "paragraph+" });
    });

    describe("fields", () => {
      describe("richText", () => {
        it("should allow the user to specify custom toDOM and parseDOM properties on richText props", () => {
          const fieldSpec = {
            prop1: {
              type: "richText" as const,
              content: "text",
              toDOM: () => "element-testelement1-prop1",
              parseDOM: [{ tag: "header" }],
            },
          };

          const testElement1 = createNoopElement("testElement1", fieldSpec);
          const { nodeSpec } = buildElementPlugin([testElement1]);
          expect(nodeSpec.get("prop1")).toEqual({
            content: fieldSpec.prop1.content,
            toDOM: fieldSpec.prop1.toDOM,
            parseDOM: fieldSpec.prop1.parseDOM,
          });
        });
      });

      describe("text", () => {
        it("should provide a default inline node spec", () => {
          const fieldSpec = {
            prop1: {
              type: "text" as const,
            },
          };

          const testElement1 = createNoopElement("testElement1", fieldSpec);
          const { nodeSpec } = buildElementPlugin([testElement1]);
          const prop1NodeSpec = nodeSpec.get("prop1");
          expect(prop1NodeSpec).toHaveProperty("content", "text*");
          expect(prop1NodeSpec).toHaveProperty("parseDOM", [{ tag: "div" }]);
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

          const testElement1 = createNoopElement("testElement1", fieldSpec);
          const { nodeSpec } = buildElementPlugin([testElement1]);
          expect(nodeSpec.get("prop1")).toMatchObject({
            atom: true,
            attrs: {
              fields: {
                default: {
                  value: true,
                },
              },
            },
          });
        });
      });

      describe("custom", () => {
        it("should specify the appropriate fields for custom props", () => {
          const fieldSpec = {
            prop1: {
              type: "custom",
              defaultValue: { arbitraryField: "hai" },
            } as CustomField<{ arbitraryField: string }>,
          };

          const testElement1 = createNoopElement("testElement1", fieldSpec);
          const { nodeSpec } = buildElementPlugin([testElement1]);
          expect(nodeSpec.get("prop1")).toMatchObject({
            atom: true,
            attrs: {
              fields: {
                default: {
                  value: {
                    arbitraryField: "hai",
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
