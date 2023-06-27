import type { FieldValidator } from "../../plugin/elementSpec";
import type { Asset } from "../helpers/defaultTransform";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isStringOrNumber = (value: unknown): value is string | number => {
  return typeof value === "string" || typeof value === "number";
};

const stringOrNumberToNumber = (value: string | number) =>
  parseInt(value.toString());

const isValidImageAsset = (maybeImage: unknown): maybeImage is Asset => {
  return (
    isRecord(maybeImage) &&
    maybeImage.fields !== undefined &&
    isRecord(maybeImage.fields) &&
    maybeImage.fields.width !== undefined &&
    maybeImage.fields.height !== undefined &&
    isStringOrNumber(maybeImage.fields.width) &&
    isStringOrNumber(maybeImage.fields.height) &&
    !isNaN(stringOrNumberToNumber(maybeImage.fields.width)) &&
    !isNaN(stringOrNumberToNumber(maybeImage.fields.height))
  );
};

const hasAssets = (maybeData: unknown): maybeData is { assets: Asset[] } => {
  return (
    isRecord(maybeData) &&
    maybeData.assets != undefined &&
    Array.isArray(maybeData.assets) &&
    maybeData.assets.length > 0 &&
    maybeData.assets.every((asset) => isValidImageAsset(asset))
  );
};

export const largestAssetMinDimension = (minSize: number): FieldValidator => (
  value
) => {
  if (hasAssets(value)) {
    const largestImageAsset = value.assets.sort(function (a, b) {
      return (
        stringOrNumberToNumber(b.fields.width) -
        stringOrNumberToNumber(a.fields.width)
      );
    })[0];

    if (
      stringOrNumberToNumber(largestImageAsset.fields.width.toString()) <
        minSize &&
      stringOrNumberToNumber(largestImageAsset.fields.height) < minSize
    ) {
      return [
        {
          error:
            "Warning: Small image. Image should be greater than 460 x 460px for uses other than a thumbnail",
          message:
            "Image should be greater than 460 x 460px for uses other than a thumbnail.",
          level: "WARN",
        },
      ];
    }
  }

  return [];
};
