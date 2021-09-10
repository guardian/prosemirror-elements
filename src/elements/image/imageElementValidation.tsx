import type { Validator } from "../../plugin/helpers/validation";
import type { Asset } from "./ImageElement";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isValidImageAsset = (maybeImage: unknown): maybeImage is Asset => {
  return (
    isRecord(maybeImage) &&
    maybeImage.fields !== undefined &&
    isRecord(maybeImage.fields) &&
    maybeImage.fields.width !== undefined &&
    maybeImage.fields.height !== undefined &&
    typeof maybeImage.fields.width === "number" &&
    typeof maybeImage.fields.height === "number"
  );
};

const hasAssets = (maybeData: unknown): maybeData is { assets: Asset[] } => {
  return (
    isRecord(maybeData) &&
    maybeData.assets != undefined &&
    Array.isArray(maybeData.assets) &&
    maybeData.assets.every((asset) => isValidImageAsset(asset))
  );
};

export const largestAssetMinDimension = (minSize: number): Validator => (
  value
) => {
  if (hasAssets(value)) {
    const largestImageAsset = value.assets.sort(function (a, b) {
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
