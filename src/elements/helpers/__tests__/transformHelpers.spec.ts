import type { Asset } from "../defaultTransform";
import {
  moveAssetsAndFieldsInline,
  pipe,
  stringToBool,
} from "../transformHelpers";

describe("moveAssetsAndFieldsInline", () => {
  const { in: inFn, out: outFn } = moveAssetsAndFieldsInline<{
    assets: Asset[];
    fields: { something: string };
  }>();
  it("should move assets and fields inline - in", () => {
    const result = inFn({
      assets: [],
      fields: { something: "hai" },
    });

    expect(result).toEqual({ assets: [], something: "hai" });
  });

  it("should move assets and fields inline - out", () => {
    const result = outFn({ assets: [], something: "hai" });

    expect(result).toEqual({ assets: [], fields: { something: "hai" } });
  });
});

describe("stringToBool", () => {
  const { in: inFn, out: outFn } = stringToBool("isMandatory");

  it("should transform field properties to boolean values - in", () => {
    let result = inFn({ otherValue: "true", isMandatory: "true" });

    expect(result).toEqual({ otherValue: "true", isMandatory: true });

    result = inFn({ otherValue: "true", isMandatory: "false" });

    expect(result).toEqual({ otherValue: "true", isMandatory: false });
  });

  it("should transform field properties to boolean values - in", () => {
    let result = outFn({ otherValue: "true", isMandatory: true });

    expect(result).toEqual({ otherValue: "true", isMandatory: "true" });

    result = outFn({ otherValue: "true", isMandatory: false });

    expect(result).toEqual({ otherValue: "true", isMandatory: "false" });
  });
});

describe("pipe", () => {
  type ExampleElement = {
    assets: Asset[];
    fields: { isMandatory: string; otherValue: string };
  };
  const {
    in: moveAssetsIn,
    out: moveAssetsOut,
  } = moveAssetsAndFieldsInline<ExampleElement>();
  const { in: mandatoryIn, out: mandatoryOut } = stringToBool("isMandatory");

  it("should pipe several methods - in", () => {
    const externalElement = {
      assets: [],
      fields: { otherValue: "true", isMandatory: "true" },
    };

    const composedIn = pipe(externalElement, moveAssetsIn, mandatoryIn);

    expect(composedIn).toEqual({
      assets: [],
      otherValue: "true",
      isMandatory: true,
    });
  });

  it("should pipe several methods - out", () => {
    const internalElement = {
      otherValue: "true",
      isMandatory: true,
      assets: [],
    };

    const composedIn = pipe(internalElement, mandatoryOut, moveAssetsOut);

    expect(composedIn).toEqual({
      assets: [],
      fields: {
        otherValue: "true",
        isMandatory: "true",
      },
    });
  });
});
