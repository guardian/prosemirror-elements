import {
  transfromElementIn,
  transfromElementOut,
} from "../transformer/Transform";

describe("transform", () => {
  describe("transfromIn", () => {
    it("should not allow elements which are the wrong type", () => {
      // @ts-expect-error -- we should not be able to transfrom a malformed element
      transfromElementIn("code", {});

      transfromElementIn("code", {
        assets: [],
        // @ts-expect-error -- we should not be able to transfrom a malformed element
        fields: { nonExistantField: "123" },
      });
    });
    it("should partially transform elements with no fields", () => {
      const codeElement = { assets: [], fields: {} };
      const result = transfromElementIn("code", codeElement);

      expect(result).toEqual({ assets: [] });
    });
    it("should partially transform elements with some fields", () => {
      const codeElement = { assets: [], fields: { html: "123" } };
      const result = transfromElementIn("code", codeElement);

      expect(result).toEqual({ assets: [], html: "123" });
    });
    it("should completely transform elements with all fields", () => {
      const codeElement = {
        assets: [],
        fields: { html: "123", langaue: "HTML" },
      };
      const result = transfromElementIn("code", codeElement);

      expect(result).toEqual({ assets: [], html: "123", langaue: "HTML" });
    });
  });
  describe("transformOut", () => {
    it("should not allow elements which are the wrong type", () => {
      // @ts-expect-error -- we should not be able to transfrom a malformed element
      transfromElementOut("code", {});

      // @ts-expect-error -- we should not be able to transfrom a malformed element
      transfromElementOut("code", { html: "123" });
    });
    it("should completely transform elements with all fields", () => {
      const codeElement = { html: "123", language: "HTML" };
      const result = transfromElementOut("code", codeElement);

      expect(result).toEqual({
        assets: [],
        fields: { html: "123", language: "HTML" },
      });
    });
  });
});
