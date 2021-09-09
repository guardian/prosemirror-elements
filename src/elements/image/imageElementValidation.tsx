import type { Validator } from "../../plugin/helpers/validation";
import type { Asset } from "./ImageElement";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isValidImageAsset = (
  maybeImage: Record<string, unknown>
): maybeImage is Asset => {
  return (
    maybeImage.fields !== undefined &&
    isRecord(maybeImage.fields) &&
    maybeImage.fields.width !== undefined &&
    maybeImage.fields.height !== undefined &&
    typeof maybeImage.fields.width === "number" &&
    typeof maybeImage.fields.height === "number"
  );
};

const validateAssets = (maybeAssets: unknown[]) => {
  const assets = maybeAssets.map((asset, i) => {
    if (!isRecord(asset)) {
      throw new Error(
        `[largestAssetMinDimension]: asset ${i} passed to validator was not an object`
      );
    }
    if (!isValidImageAsset(asset)) {
      throw new Error(
        `[largestAssetMinDimension]: asset ${i} does not have height and width props that are numbers`
      );
    }
    return asset;
  });
  return assets;
};

export const largestAssetMinDimension = (minSize: number): Validator => (
  value
) => {
  if (typeof value !== "object" || value === null) {
    throw new Error(
      `[largestAssetMinDimension]: overall value passed to validator is not an object`
    );
  }

  if (isRecord(value) && value.assets && Array.isArray(value.assets)) {
    const validatedAssets = validateAssets(value.assets);
    const largestImageAsset = validatedAssets.sort(function (a, b) {
      return b.fields.width - a.fields.width;
    })[0];

    if (
      largestImageAsset.fields.width < minSize &&
      largestImageAsset.fields.height < minSize
    ) {
      return [
        {
          error: "Warning: Small image, only thumbnail available",
          message:
            "Image should be greater than 460 x 460px for uses other than a thumbnail.",
        },
      ];
    }
  }

  return [];
};
