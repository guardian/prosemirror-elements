import type { FieldNameToValueMap } from "../../../../plugin/helpers/fieldView";
import { undefinedDropdownValue } from "../../../helpers/transform";
import type { ExternalEmbedFields } from "../../embedDataTransformer";
import { transformElement } from "../../embedDataTransformer";
import type { createEmbedFields } from "../../EmbedSpec";

const partialPmeElement = (
  data: Partial<FieldNameToValueMap<ReturnType<typeof createEmbedFields>>> = {}
): Partial<FieldNameToValueMap<ReturnType<typeof createEmbedFields>>> => {
  return {
    alt: undefined,
    caption: undefined,
    role: "none-selected",
    html: undefined,
    url: undefined,
    isMandatory: false,
    ...data,
  };
};

const fullPmeElement = (
  data: Partial<FieldNameToValueMap<ReturnType<typeof createEmbedFields>>> = {}
): FieldNameToValueMap<ReturnType<typeof createEmbedFields>> => {
  return {
    alt: "",
    caption: "",
    role: "none-selected",
    html: "",
    url: "",
    isMandatory: false,
    ...data,
  };
};

const externalElement = (data: Partial<ExternalEmbedFields> = {}) => {
  return {
    fields: {
      html: "",
      isMandatory: "false",
      safeEmbedCode: "false",
      role: undefined,
      ...data,
    },
  };
};

describe("embed element transform", () => {
  describe("transformIn", () => {
    it("should not allow elements which are the wrong type", () => {
      // @ts-expect-error -- we should not be able to transform a malformed element
      expect(() => transformElement.in({})).toThrow;
      expect(() =>
        transformElement.in({
          // @ts-expect-error -- we should not be able to transform a malformed element
          fields: { nonExistantField: "123" },
        })
      ).toThrow;
    });
    it("should partially transform elements with no fields", () => {
      const element = { fields: {} };
      const result = transformElement.in(element);
      expect(result).toEqual(partialPmeElement());
    });

    it("should partially transform elements with some fields", () => {
      const altText = "alt text";
      const element = {
        fields: { alt: altText, isMandatory: "true" },
      };
      const result = transformElement.in(element);
      expect(result).toEqual(
        partialPmeElement({ alt: altText, isMandatory: true })
      );
    });
    it("should convert undefined dropdown to undefined string", () => {
      const element = {
        fields: { role: undefined },
      };
      const result = transformElement.in(element);
      expect(result).toEqual(
        partialPmeElement({ role: undefinedDropdownValue })
      );
    });
    it("should not convert regular dropdown strings", () => {
      const element = {
        fields: { role: "showcase" },
      };
      const result = transformElement.in(element);
      expect(result).toEqual(partialPmeElement({ role: "showcase" }));
    });
    it("should convert isMandatory to boolean", () => {
      const element = {
        fields: { isMandatory: "false" },
      };
      const result = transformElement.in(element);
      expect(result).toEqual(partialPmeElement({ isMandatory: false }));
    });
  });

  describe("transformOut", () => {
    it("should not allow elements which are the wrong type", () => {
      // @ts-expect-error -- we should not be able to transform a malformed element
      expect(() => transformElement.out({})).toThrow;
      expect(() =>
        transformElement.out({
          // @ts-expect-error -- we should not be able to transform a malformed element
          nonExistantField: "123",
        })
      ).toThrow;
    });
    it("should completely transform elements with all fields", () => {
      const element = fullPmeElement();
      const result = transformElement.out(element);
      expect(result).toEqual(externalElement());
    });
    it("should convert undefined dropdown string to undefined", () => {
      const element = fullPmeElement({ role: undefinedDropdownValue });
      const result = transformElement.out(element);
      expect(result).toEqual(externalElement({ role: undefined }));
    });
    it("should not convert regular dropdown strings", () => {
      const element = fullPmeElement({ role: "showcase" });
      const result = transformElement.out(element);
      expect(result).toEqual(externalElement({ role: "showcase" }));
    });
    it("should convert isMandatory to string", () => {
      const element = fullPmeElement({ isMandatory: false });
      const result = transformElement.out(element);
      expect(result).toEqual(externalElement({ isMandatory: "false" }));
    });
    it("should include optional fields when specified", () => {
      const element = fullPmeElement({
        alt: "Alt text",
        caption: "caption",
        url: "https://example.com/",
      });
      const result = transformElement.out(element);
      expect(result).toEqual(
        externalElement({
          alt: "Alt text",
          caption: "caption",
          url: "https://example.com/",
        })
      );
    });
    it("should not include optional fields when they are empty", () => {
      const element = fullPmeElement({
        alt: "",
        caption: "",
        url: "",
      });
      const result = transformElement.out(element);
      expect(result).toEqual(externalElement());
    });
  });
});
