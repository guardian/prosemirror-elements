import { buildElementPlugin } from "../element";
import { createElementSpec } from "../elementSpec";
import type { CustomFieldDescription } from "../fieldViews/CustomFieldView";
import { createNoopElement } from "../helpers/test";
import { getNodeNameFromField } from "../nodeSpec";

describe("mount", () => {
  describe("fieldView typesafety", () => {
    it("should provide typesafe fieldView to its consumer", () => {
      const fieldDescriptions = {
        field1: {
          type: "richText",
        },
      } as const;
      createElementSpec(
        fieldDescriptions,
        (_, __, fieldViews) => {
          // field1 is derived from the fieldDescriptions
          fieldViews.field1;
        },
        () => undefined
      );
    });

    it("should not typecheck when fields are not provided", () => {
      const fieldDescriptions = {
        notField1: {
          type: "richText",
        },
      } as const;
      createElementSpec(
        fieldDescriptions,
        (_, __, fieldViews) => {
          // @ts-expect-error – field1 is not available on this object,
          // as it is not defined in `fieldDescriptions` passed into `mount`
          fieldViews.field1;
        },
        () => undefined
      );
    });
  });

  describe("validator typesafety", () => {
    it("should provide typesafe fields to its validator", () => {
      const fieldDescriptions = {
        field1: {
          type: "richText",
        },
        field2: {
          type: "checkbox",
          defaultValue: true,
        },
      } as const;
      createElementSpec(
        fieldDescriptions,
        () => () => undefined,
        (fields) => {
          // field1 is derived from the fieldDescriptions, and is a string b/c it's a richText field
          fields.field1?.toString();
          // field2 is a boolean b/c it's a checkbox field
          fields.field2?.valueOf();
          return undefined;
        }
      );
    });

    it("should not typecheck when fields are not provided", () => {
      const fieldDescriptions = {
        notField1: {
          type: "richText",
        },
      } as const;
      createElementSpec(
        fieldDescriptions,
        () => () => undefined,
        (fields) => {
          // @ts-expect-error – field1 is not available on this object,
          // as it is not defined in `fieldDescriptions` passed into `mount`
          fields.doesNotExist;
          return undefined;
        }
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

    it("should convert dashes in element names to underscores", () => {
      const testElement1 = createNoopElement({});
      const { nodeSpec } = buildElementPlugin({
        "test-element-1": testElement1,
      });
      expect(nodeSpec.size).toBe(1);
      expect(nodeSpec.get("test_element_1")).toMatchObject({ content: "" });
    });

    it("should add a custom group if specified", () => {
      const testElement1 = createNoopElement({});
      const { nodeSpec } = buildElementPlugin({ testElement1 }, "customGroup");
      expect(nodeSpec.get("testElement1")).toMatchObject({
        group: "customGroup",
      });
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
        content: "testElement1__field1 testElement1__field2",
      });
      expect(nodeSpec.get("testElement1__field1")).toMatchObject({
        content: "paragraph+",
      });
      expect(nodeSpec.get("testElement1__field2")).toMatchObject({
        content: "paragraph+",
      });
    });

    describe("fields", () => {
      describe("richText", () => {
        it("should allow the user to specify content, attribute and marks properties", () => {
          const fieldDescriptions = {
            field1: {
              type: "richText" as const,
              attrs: { customAttr: { default: "custom" } },
              content: "content",
              marks: "some marks",
            },
          };

          const testElement1 = createNoopElement(fieldDescriptions);
          const { nodeSpec } = buildElementPlugin({ testElement1 });

          expect(
            nodeSpec.get(getNodeNameFromField("field1", "testElement1"))
          ).toMatchObject({
            content: fieldDescriptions.field1.content,
            attrs: fieldDescriptions.field1.attrs,
            marks: fieldDescriptions.field1.marks,
          });
        });
      });

      describe("text", () => {
        it("should allow the user to specify custom attributes", () => {
          const fieldDescriptions = {
            field1: {
              type: "text" as const,
              attrs: { customAttr: { default: "custom" } },
              isMultiline: false,
              rows: 1,
              isCode: false,
            },
          };

          const testElement1 = createNoopElement(fieldDescriptions);
          const { nodeSpec } = buildElementPlugin({ testElement1 });

          expect(
            nodeSpec.get(getNodeNameFromField("field1", "testElement1"))
          ).toMatchObject({
            attrs: fieldDescriptions.field1.attrs,
          });
        });
        it("should provide a default inline node spec", () => {
          const fieldDescriptions = {
            field1: {
              type: "text" as const,
              isMultiline: false,
              rows: 1,
              isCode: false,
            },
          };

          const testElement1 = createNoopElement(fieldDescriptions);
          const { nodeSpec } = buildElementPlugin({ testElement1 });
          const field1NodeSpec = nodeSpec.get(
            getNodeNameFromField("field1", "testElement1")
          );
          expect(field1NodeSpec).toHaveProperty("content", "text*");
          expect(field1NodeSpec?.parseDOM?.[0]).toMatchObject({
            tag: "div",
            preserveWhitespace: false,
          });
        });
      });

      describe("checkbox", () => {
        it("should specify the appropriate fields on checkbox fields", () => {
          const fieldDescriptions = {
            field1: {
              type: "checkbox" as const,
              defaultValue: true,
            },
          };

          const testElement1 = createNoopElement(fieldDescriptions);
          const { nodeSpec } = buildElementPlugin({ testElement1 });
          expect(
            nodeSpec.get(getNodeNameFromField("field1", "testElement1"))
          ).toMatchObject({
            atom: true,
            attrs: {
              fields: {
                default: true,
              },
            },
          });
        });
      });

      describe("custom", () => {
        it("should specify the appropriate fields for custom fields", () => {
          const fieldDescriptions = {
            field1: {
              type: "custom",
              defaultValue: { arbitraryField: "hai" },
            } as CustomFieldDescription<{ arbitraryField: string }>,
          };

          const testElement1 = createNoopElement(fieldDescriptions);
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
