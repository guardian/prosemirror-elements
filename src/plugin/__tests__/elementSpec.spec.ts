import { buildElementPlugin } from "../element";
import { createElementSpec } from "../elementSpec";
import { createNoopElement } from "../helpers/test";

describe("createElementSpec", () => {
  describe("fieldView typesafety", () => {
    it("should provide typesafe fieldView to its consumer", () => {
      const fieldDescriptions = {
        field1: {
          type: "richText",
        },
      } as const;
      createElementSpec(
        fieldDescriptions,
        ({ fields }) => {
          // field1 is derived from the fieldDescriptions
          fields.field1;
        },
        () => undefined,
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
        ({ fields }) => {
          // @ts-expect-error – field1 is not available on this object,
          // as it is not defined in `fieldDescriptions` passed into `mount`
          fields.field1;
        },
        () => undefined,
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
        () => () => undefined,
        (fields) => {
          // @ts-expect-error – field1 is not available on this object,
          // as it is not defined in `fieldDescriptions` passed into `mount`
          fields.doesNotExist;
          return undefined;
        },
        () => undefined
      );
    });
  });

  describe("NodeSpec generation", () => {
    it("should create an nodeSpec with no nodes when the spec is empty", () => {
      const { nodeSpec } = buildElementPlugin({});
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

    it("should add a custom group if specified", () => {
      const testElement1 = createNoopElement({});
      const { nodeSpec } = buildElementPlugin(
        { testElement1 },
        { groupName: "customGroup" }
      );
      expect(nodeSpec.get("testElement1")).toMatchObject({
        group: "customGroup",
      });
    });
  });
});
