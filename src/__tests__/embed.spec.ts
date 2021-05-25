import { buildEmbedPlugin } from "../embed";
import { createNoopEmbed } from "./helpers";

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
  });
});
