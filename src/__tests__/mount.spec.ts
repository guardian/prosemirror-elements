import { build } from "../embed";
import { mount } from "../mount";
import { createNoopEmbed } from "./helpers";

describe("mount", () => {
  describe("nestedEditorProps typesafety", () => {
    it("should provide typesafe nestedEditorProps to its consumer", () => {
      const props = {
        prop1: {
          type: "richText",
        },
      } as const;
      mount(
        "testEmbed",
        props,
        () => () => null,
        (_, __, ___, nestedEditorProps) => {
          // Prop1 is derived from the props
          nestedEditorProps.prop1;
        },
        () => null,
        {}
      );
    });

    it("should not typecheck when props are not provided", () => {
      const props = {
        notProp1: {
          type: "richText",
        },
      } as const;
      mount(
        "testEmbed",
        props,
        () => () => null,
        (_, __, ___, nestedEditorProps) => {
          // @ts-expect-error – prop1 is not available on this object,
          // as it is not defined in `props` passed into `mount`
          nestedEditorProps.prop1;
        },
        () => null,
        {}
      );
    });
  });
  describe("nodeSpec generation", () => {
    it("should create an nodeSpec with no nodes when the spec is empty", () => {
      const { nodeSpec } = build([]);
      expect(nodeSpec.size).toBe(0);
    });

    it("should create an nodeSpec with a parent node for each embed", () => {
      const testEmbed1 = createNoopEmbed("testEmbed1", {});
      const testEmbed2 = createNoopEmbed("testEmbed2", {});
      const { nodeSpec } = build([testEmbed1, testEmbed2]);
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
      const { nodeSpec } = build([testEmbed1]);
      expect(nodeSpec.get("testEmbed1")).toMatchObject({
        content: "prop1 prop2",
      });
      expect(nodeSpec.get("prop1")).toMatchObject({ content: "paragraph" });
      expect(nodeSpec.get("prop2")).toMatchObject({ content: "paragraph" });
    });

    it("should allow the user to specify custom toDOM and parseDOM properties on richText props", () => {
      const props = {
        prop1: {
          type: "richText" as const,
          content: "text",
          toDOM: () => "div",
          parseDOM: [{ tag: "header" }],
        },
      };

      const testEmbed1 = createNoopEmbed("testEmbed1", props);
      const { nodeSpec } = build([testEmbed1]);
      expect(nodeSpec.get("prop1")).toEqual({
        content: props.prop1.content,
        toDOM: props.prop1.toDOM,
        parseDOM: props.prop1.parseDOM,
      });
    });
  });
});
