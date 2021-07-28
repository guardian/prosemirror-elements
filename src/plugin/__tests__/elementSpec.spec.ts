import { buildElementPlugin } from "../element";
import { createElementSpec } from "../elementSpec";
import type { CustomField } from "../fieldViews/CustomFieldView";
import { createNoopElement } from "../helpers/test";
import { getNodeNameFromField } from "../nodeSpec";

describe("mount", () => {
  describe("fieldView typesafety", () => {
    it("should provide typesafe fieldView to its consumer", () => {
      const fieldSpec = {
        field1: {
          type: "richText",
        },
      } as const;
      createElementSpec(
        fieldSpec,
        (_, __, fieldViews) => {
          // field1 is derived from the fieldSpec
          fieldViews.field1;
        },
        () => null,
        { field1: "text" }
      );
    });

    it("should not typecheck when fields are not provided", () => {
      const fieldSpec = {
        notField1: {
          type: "richText",
        },
      } as const;
      createElementSpec(
        fieldSpec,
        (_, __, fieldViews) => {
          // @ts-expect-error – field1 is not available on this object,
          // as it is not defined in `fieldSpec` passed into `mount`
          fieldViews.field1;
        },
        () => null,
        { notField1: "text" }
      );
    });
  });

  describe("validator typesafety", () => {
    it("should provide typesafe fields to its validator", () => {
      const fieldSpec = {
        field1: {
          type: "richText",
        },
        field2: {
          type: "checkbox",
          defaultValue: { value: true },
        },
      } as const;
      createElementSpec(
        fieldSpec,
        () => () => undefined,
        (fields) => {
          // field1 is derived from the fieldSpec, and is a string b/c it's a richText field
          fields.field1.toString();
          // field2 is a boolean b/c it's a checkbox field
          fields.field2.value.valueOf();
          return null;
        },
        { field1: "text" }
      );
    });

    it("should not typecheck when fields are not provided", () => {
      const fieldSpec = {
        notField1: {
          type: "richText",
        },
      } as const;
      createElementSpec(
        fieldSpec,
        () => () => undefined,
        (fields) => {
          // @ts-expect-error – field1 is not available on this object,
          // as it is not defined in `fieldSpec` passed into `mount`
          fields.doesNotExist;
          return null;
        },
        { notField1: "text" }
      );
    });
  });

  describe("nodeSpec generation", () => {
    it("should create an nodeSpec with no nodes when the spec is empty", () => {
      const { nodeSpec } = buildElementPlugin([]);
      expect(nodeSpec.size).toBe(0);
    });

    it("should create an nodeSpec with a parent node for each element", () => {
      const testElement1 = createNoopElement({});
      const testElement2 = createNoopElement({});
      const { nodeSpec } = buildElementPlugin({ testElement1, testElement2 });
      expect(nodeSpec.size).toBe(2);
      expect(nodeSpec.get("testElement1")).toMatchObject({ content: "" });
      expect(nodeSpec.get("testElement2")).toMatchObject({ content: "" });
    });

    it("should create child nodes for each element field, and the parent node should include them in its content expression", () => {
      const testElement1 = createNoopElement({
        field1: {
          type: "richText",
        },
        field2: {
          type: "richText",
        },
      });
      const { nodeSpec } = buildElementPlugin({ testElement1 });
      expect(nodeSpec.get("testElement1")).toMatchObject({
        content: "testElement1_field1 testElement1_field2",
      });
      expect(nodeSpec.get("testElement1_field1")).toMatchObject({
        content: "paragraph+",
      });
      expect(nodeSpec.get("testElement1_field2")).toMatchObject({
        content: "paragraph+",
      });
    });

    describe("fields", () => {
      describe("richText", () => {
        it("should allow the user to specify custom toDOM and parseDOM properties on richText fields", () => {
          const fieldSpec = {
            field1: {
              type: "richText" as const,
              content: "text",
              toDOM: () => "element-testelement1-field1",
              parseDOM: [{ tag: "header" }],
            },
          };

          const testElement1 = createNoopElement(fieldSpec);
          const { nodeSpec } = buildElementPlugin({ testElement1 });

          expect(
            nodeSpec.get(getNodeNameFromField("field1", "testElement1"))
          ).toEqual({
            content: fieldSpec.field1.content,
            toDOM: fieldSpec.field1.toDOM,
            parseDOM: fieldSpec.field1.parseDOM,
          });
        });
      });

      describe("text", () => {
        it("should provide a default inline node spec", () => {
          const fieldSpec = {
            field1: {
              type: "text" as const,
              isMultiline: false,
              rows: 1,
              isCode: false,
            },
          };

          const testElement1 = createNoopElement(fieldSpec);
          const { nodeSpec } = buildElementPlugin({ testElement1 });
          const field1NodeSpec = nodeSpec.get(
            getNodeNameFromField("field1", "testElement1")
          );
          expect(field1NodeSpec).toHaveProperty("content", "text*");
          expect(field1NodeSpec).toHaveProperty("parseDOM", [
            { tag: "element-testelement1-field1" },
          ]);
        });
      });

      describe("checkbox", () => {
        it("should specify the appropriate fields on checkbox fields", () => {
          const fieldSpec = {
            field1: {
              type: "checkbox" as const,
              defaultValue: { value: true },
            },
          };

          const testElement1 = createNoopElement(fieldSpec);
          const { nodeSpec } = buildElementPlugin({ testElement1 });
          expect(
            nodeSpec.get(getNodeNameFromField("field1", "testElement1"))
          ).toMatchObject({
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
        it("should specify the appropriate fields for custom fields", () => {
          const fieldSpec = {
            field1: {
              type: "custom",
              defaultValue: { arbitraryField: "hai" },
            } as CustomField<{ arbitraryField: string }>,
          };

          const testElement1 = createNoopElement(fieldSpec);
          const { nodeSpec } = buildElementPlugin({ testElement1 });
          expect(
            nodeSpec.get(getNodeNameFromField("field1", "testElement1"))
          ).toMatchObject({
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
