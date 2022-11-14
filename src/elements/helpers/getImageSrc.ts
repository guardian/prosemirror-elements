import type { Asset } from "./defaultTransform";

export const getImageSrc = (assets: Asset[], desiredWidth: number) => {
  const widthDifference = (width: number) => Math.abs(desiredWidth - width);

  const stringOrNumberToNumber = (value: string | number) => {
    const parsedValue = parseInt(value.toString());
    return !isNaN(parsedValue) ? parsedValue : 0;
  };

  const sortByWidthDifference = (assetA: Asset, assetB: Asset) =>
    widthDifference(stringOrNumberToNumber(assetA.fields.width)) -
    widthDifference(stringOrNumberToNumber(assetB.fields.width));

  const sortedAssets = assets
    .filter((asset) => !asset.fields.isMaster)
    .sort(sortByWidthDifference);

  return sortedAssets.length > 0 ? sortedAssets[0].url : undefined;
};
