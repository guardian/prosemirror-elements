import type { FieldNameToValueMap } from "../../../plugin/helpers/fieldView";
import { undefinedDropdownValue } from "../../helpers/transform";
import type { createImageFields } from "../ImageElement";
import type { ImageFields } from "../imageElementDataTransformer";
import { transformElement } from "../imageElementDataTransformer";

const partialPmeElement = (
  data: Partial<FieldNameToValueMap<ReturnType<typeof createImageFields>>> = {}
): Partial<FieldNameToValueMap<ReturnType<typeof createImageFields>>> => {
  return {
    alt: undefined,
    caption: undefined,
    displayCredit: false,
    imageType: undefined,
    mainImage: {
      assets: [],
      mediaApiUri: undefined,
      mediaId: undefined,
      suppliersReference: "",
    },
    role: "none-selected",
    source: undefined,
    ...data,
  };
};

const fullPmeElement = (
  data: Partial<FieldNameToValueMap<ReturnType<typeof createImageFields>>> = {}
): FieldNameToValueMap<ReturnType<typeof createImageFields>> => {
  return {
    alt: "",
    caption: "",
    displayCredit: true,
    imageType: "",
    mainImage: {
      assets: [],
      mediaApiUri: undefined,
      mediaId: undefined,
      suppliersReference: "",
    },
    photographer: "",
    role: "none-selected",
    source: "",
    ...data,
  };
};

const externalElement = (data: Partial<ImageFields> = {}) => {
  return {
    assets: [],
    fields: {
      displayCredit: "true",
      imageType: "",
      isMandatory: "true",
      mediaApiUri: "",
      mediaId: "",
      role: undefined,
      suppliersReference: "",
      ...data,
    },
  };
};

describe("image element transform", () => {
  describe("transformIn", () => {
    it("should not allow elements which are the wrong type", () => {
      // @ts-expect-error -- we should not be able to transform a malformed element
      expect(() => transformElement.in({})).toThrow;
      expect(() =>
        transformElement.in({
          assets: [],
          // @ts-expect-error -- we should not be able to transform a malformed element
          fields: { nonExistantField: "123" },
        })
      ).toThrow;
    });
    it("should partially transform elements with no fields", () => {
      const element = { assets: [], fields: {} };
      const result = transformElement.in(element);
      expect(result).toEqual(partialPmeElement());
    });
    it("should partially transform elements with some fields", () => {
      const altText = "alt text";
      const element = {
        assets: [],
        fields: { alt: altText, displayCredit: "true" },
      };
      const result = transformElement.in(element);
      expect(result).toEqual(
        partialPmeElement({ alt: altText, displayCredit: true })
      );
    });
    it("should convert undefined dropdown to undefined string", () => {
      const element = {
        assets: [],
        fields: { role: undefined },
      };
      const result = transformElement.in(element);
      expect(result).toEqual(
        partialPmeElement({ role: undefinedDropdownValue })
      );
    });
    it("should not convert regular dropdown strings", () => {
      const element = {
        assets: [],
        fields: { role: "showcase" },
      };
      const result = transformElement.in(element);
      expect(result).toEqual(partialPmeElement({ role: "showcase" }));
    });
    it("should convert displayCredit to boolean", () => {
      const element = {
        assets: [],
        fields: { displayCredit: "false" },
      };
      const result = transformElement.in(element);
      expect(result).toEqual(partialPmeElement({ displayCredit: false }));
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
    it("should convert displayCredit to string", () => {
      const element = fullPmeElement({ displayCredit: false });
      const result = transformElement.out(element);
      expect(result).toEqual(externalElement({ displayCredit: "false" }));
    });
    it("should include optional fields when specified", () => {
      const element = fullPmeElement({
        photographer: "Ansel Adams",
        alt: "Alt text",
        caption: "caption",
        source: "Source",
      });
      const result = transformElement.out(element);
      expect(result).toEqual(
        externalElement({
          photographer: "Ansel Adams",
          alt: "Alt text",
          caption: "caption",
          source: "Source",
        })
      );
    });
    it("should not include optional fields when they are empty", () => {
      const element = fullPmeElement({
        photographer: "",
        alt: "",
        caption: "",
        source: "",
      });
      const result = transformElement.out(element);
      expect(result).toEqual(externalElement());
    });
  });
});
