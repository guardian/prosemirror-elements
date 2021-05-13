import { build } from "./embed";
import { mount } from "./mount";
import type { ElementProps } from "./types/Embed";

/**
 * Create an embed which renders nothing. Useful when testing schema output.
 */
export const createNoopEmbed = (name: string, props: ElementProps) =>
  mount(
    name,
    props,
    () => () => null,
    () => null,
    () => null,
    {}
  );

describe("mount", () => {
  describe("nodeSpec generation", () => {
    it("should create an nodeSpec with no nodes when the spec is empty", () => {
      const { nodeSpec } = build([]);
      expect(nodeSpec.size).toBe(0);
    });

    it("should create an nodeSpec with a parent node for each embed", () => {
      const testEmbed1 = createNoopEmbed("testEmbed1", []);
      const testEmbed2 = createNoopEmbed("testEmbed2", []);
      const { nodeSpec } = build([testEmbed1, testEmbed2]);
      expect(nodeSpec.size).toBe(2);
      expect(nodeSpec.get("testEmbed1")).toMatchObject({ content: "" });
      expect(nodeSpec.get("testEmbed1")).toMatchObject({ content: "" });
    });

    it("should create child nodes for each embed prop, and the parent node should include them in its content expression", () => {
      const testEmbed1 = createNoopEmbed("testEmbed1", [
        {
          type: "richText",
          name: "prop1",
        },
        {
          type: "richText",
          name: "prop2",
        },
      ]);
      const { nodeSpec } = build([testEmbed1]);
      expect(nodeSpec.get("testEmbed1")).toMatchObject({
        content: "prop1 prop2",
      });
      expect(nodeSpec.get("prop1")).toMatchObject({ content: "paragraph" });
      expect(nodeSpec.get("prop2")).toMatchObject({ content: "paragraph" });
    });

    it("should allow the user to specify custom toDOM and parseDOM properties on richText props", () => {
      const prop = {
        type: "richText" as const,
        name: "prop1",
        content: "text",
        toDOM: () => "div",
        parseDOM: [{ tag: "header" }],
      };

      const testEmbed1 = createNoopEmbed("testEmbed1", [prop]);
      const { nodeSpec } = build([testEmbed1]);
      expect(nodeSpec.get(prop.name)).toEqual({
        content: prop.content,
        toDOM: prop.toDOM,
        parseDOM: prop.parseDOM,
      });
    });
  });
});
