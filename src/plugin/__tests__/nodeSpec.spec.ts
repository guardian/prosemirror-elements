import type { CustomFieldDescription } from "../fieldViews/CustomFieldView";
import { createRepeaterField } from "../fieldViews/RepeaterFieldView";
import { createTextField } from "../fieldViews/TextFieldView";
import { createNoopElement } from "../helpers/test";
import {
  getNodeNameFromField,
  getNodeSpecForField,
  getNodeSpecFromFieldDescriptions,
} from "../nodeSpec";

describe("nodeSpec generation", () => {
  it("should convert dashes in element names to underscores", () => {
    const testElement1 = createNoopElement({});
    const nodeSpec = getNodeSpecFromFieldDescriptions(
      "test-element-1",
      "group1",
      testElement1.fieldDescriptions
    );
    expect(nodeSpec.size).toBe(1);
    expect(nodeSpec.get("test_element_1")).toMatchObject({ content: "" });
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
    const nodeSpec = getNodeSpecFromFieldDescriptions(
      "testElement1",
      "group1",
      testElement1.fieldDescriptions
    );

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
        const nodeSpec = getNodeSpecFromFieldDescriptions(
          "testElement1",
          "group1",
          testElement1.fieldDescriptions
        );

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
        const nodeSpec = getNodeSpecFromFieldDescriptions(
          "testElement1",
          "group1",
          testElement1.fieldDescriptions
        );

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
        const nodeSpec = getNodeSpecFromFieldDescriptions(
          "testElement1",
          "group1",
          testElement1.fieldDescriptions
        );
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
        const nodeSpec = getNodeSpecFromFieldDescriptions(
          "testElement1",
          "group1",
          testElement1.fieldDescriptions
        );
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
        const nodeSpec = getNodeSpecFromFieldDescriptions(
          "testElement1",
          "group1",
          testElement1.fieldDescriptions
        );
        expect(
          nodeSpec.get(getNodeNameFromField("field1", "testElement1"))
        ).toMatchObject({
          atom: true,
          attrs: {
            fields: {
              default: {
                arbitraryField: "hai",
              },
            },
          },
        });
      });
    });

    describe("repeater", () => {
      it("should create a NodeSpec for the repeater field node that permits the nested content, and a NodeSpec for the nested field", () => {
        const nodeSpec = getNodeSpecForField(
          "exampleElement",
          "exampleRepeater",
          createRepeaterField({
            exampleField: createTextField(),
          })
        );

        expect(nodeSpec["exampleElement__exampleRepeater"]).toMatchObject({
          content: "exampleElement__exampleField",
        });
        expect(nodeSpec["exampleElement__exampleField"]).toBeTruthy();
      });

      it("should generate NodeSpecs for nested repeater fields, which can contain their own children", () => {
        const nodeSpec = getNodeSpecForField(
          "exampleElement",
          "exampleRepeater",
          createRepeaterField({
            nestedRepeaterField: createRepeaterField({
              exampleField: createTextField(),
            }),
          })
        );

        expect(nodeSpec["exampleElement__exampleRepeater"]).toMatchObject({
          content: "exampleElement__nestedRepeaterField",
        });
        expect(nodeSpec["exampleElement__nestedRepeaterField"]).toMatchObject({
          content: "exampleElement__exampleField",
        });
        expect(nodeSpec["exampleElement__exampleField"]).toBeTruthy();
      });
    });
  });
});
