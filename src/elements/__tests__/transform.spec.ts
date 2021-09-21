import {
  transformElementIn,
  transformElementOut,
} from "../transformer/transform";

describe("transform", () => {
  describe("transformIn", () => {
    it("should not allow elements which are the wrong type", () => {
      // @ts-expect-error -- we should not be able to transform a malformed element
      transformElementIn("code", {});

      transformElementIn("code", {
        assets: [],
        // @ts-expect-error -- we should not be able to transform a malformed element
        fields: { nonExistantField: "123" },
      });
    });
    it("should partially transform elements with no fields", () => {
      const codeElement = { assets: [], fields: {} };
      const result = transformElementIn("code", codeElement);

      expect(result).toEqual({});
    });
    it("should partially transform elements with some fields", () => {
      const codeElement = { assets: [], fields: { html: "123" } };
      const result = transformElementIn("code", codeElement);

      expect(result).toEqual({ html: "123" });
    });
    it("should completely transform elements with all fields", () => {
      const codeElement = {
        assets: [],
        fields: { html: "123", langaue: "HTML" },
      };
      const result = transformElementIn("code", codeElement);

      expect(result).toEqual({ html: "123", langaue: "HTML" });
    });
  });
  describe("transformOut", () => {
    it("should not allow elements which are the wrong type", () => {
      // @ts-expect-error -- we should not be able to transform a malformed element
      transformElementOut("code", {});

      // @ts-expect-error -- we should not be able to transform a malformed element
      transformElementOut("code", { html: "123" });
    });
    it("should completely transform elements with all fields", () => {
      const codeElement = { html: "123", language: "HTML" };
      const result = transformElementOut("code", codeElement);

      expect(result).toEqual({
        assets: [],
        fields: { html: "123", language: "HTML" },
      });
    });
  });
});
