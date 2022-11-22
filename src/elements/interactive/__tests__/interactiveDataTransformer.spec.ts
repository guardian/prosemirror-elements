import { undefinedDropdownValue } from "../../../plugin/helpers/constants";
import type { FieldNameToValueMap } from "../../../plugin/helpers/fieldView";
import type { ExternalInteractiveFields } from "../interactiveDataTransformer";
import { transformElement } from "../interactiveDataTransformer";
import type { createInteractiveFields } from "../InteractiveSpec";

const partialPmeElement = (
  data: Partial<
    FieldNameToValueMap<ReturnType<typeof createInteractiveFields>>
  > = {}
): Partial<FieldNameToValueMap<ReturnType<typeof createInteractiveFields>>> => {
  return {
    html: undefined,
    isMandatory: false,
    scriptUrl: undefined,
    iframeUrl: undefined,
    originalUrl: undefined,
    scriptName: undefined,
    source: undefined,
    alt: undefined,
    caption: undefined,
    role: "none-selected",
    ...data,
  };
};

const fullPmeElement = (
  data: Partial<
    FieldNameToValueMap<ReturnType<typeof createInteractiveFields>>
  > = {}
): FieldNameToValueMap<ReturnType<typeof createInteractiveFields>> => {
  return {
    html: "",
    isMandatory: false,
    scriptUrl: "",
    iframeUrl: "",
    originalUrl: "",
    scriptName: "",
    source: "",
    alt: "",
    caption: "",
    role: "none-selected",
    ...data,
  };
};

const externalElement = (data: Partial<ExternalInteractiveFields> = {}) => {
  return {
    assets: [],
    fields: {
      html: "",
      isMandatory: "false",
      scriptUrl: "",
      iframeUrl: "",
      originalUrl: "",
      scriptName: "",
      role: undefined,
      source: "",
      ...data,
    },
  };
};

describe("interactive element transform", () => {
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
      });
      const result = transformElement.out(element);
      expect(result).toEqual(
        externalElement({
          alt: "Alt text",
          caption: "caption",
        })
      );
    });
    it("should not include optional fields when they are empty", () => {
      const element = fullPmeElement({
        alt: "",
        caption: "",
      });
      const result = transformElement.out(element);
      expect(result).toEqual(externalElement());
    });
  });
});
