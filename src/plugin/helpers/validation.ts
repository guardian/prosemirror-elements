import type { FieldValidationErrors, ValidationError } from "../elementSpec";
import type { FieldNameToValueMap } from "../fieldViews/helpers";
import type { FieldDescriptions } from "../types/Element";

type Validator = (fieldValue: unknown, fieldName: string) => ValidationError[];

export const createValidator = (
  fieldValidationMap: Record<string, Validator[]>
) => <FDesc extends FieldDescriptions<string>>(
  fieldValues: FieldNameToValueMap<FDesc>
): FieldValidationErrors => {
  const errors: FieldValidationErrors = {};

  for (const fieldName in fieldValidationMap) {
    const validators = fieldValidationMap[fieldName];
    const value = fieldValues[fieldName];
    const fieldErrors = validators.flatMap((validator) =>
      validator(value, fieldName)
    );
    errors[fieldName] = fieldErrors;
  }
  return errors;
};

type ImageAsset = {
  fields: {
    width: number;
    height: number;
  };
};

function hasOwnProperty<X extends Record<string, unknown>, Y extends string>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return Object.hasOwnProperty.call(obj, prop);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidImageAsset(
  maybeImage: Record<string, unknown>
): maybeImage is ImageAsset {
  return (
    hasOwnProperty(maybeImage, "fields") &&
    isRecord(maybeImage.fields) &&
    hasOwnProperty(maybeImage.fields, "width") &&
    hasOwnProperty(maybeImage.fields, "height") &&
    typeof maybeImage.fields.width === "number" &&
    typeof maybeImage.fields.height === "number"
  );
}

function validateAssets(maybeAssets: unknown[]) {
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
}

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

    const largestDimensionMin = minSize;

    if (
      largestImageAsset.fields.width < largestDimensionMin &&
      largestImageAsset.fields.height < largestDimensionMin
    ) {
      return ["Warning: Small image, only thumbnail available"];
    }
  }

  return [];
};

export const htmlMaxLength = (
  maxLength: number,
  customMessage: string | undefined = undefined
): Validator => (value, field) => {
  if (typeof value !== "string") {
    throw new Error(`[htmlMaxLength]: value is not of type string`);
  }
  const el = document.createElement("div");
  el.innerHTML = value;
  if (el.innerText.length > maxLength) {
    return [
      {
        error: `Too long: ${value.length}/${maxLength}`,
        message:
          customMessage ?? `${field} is too long: ${value.length}/${maxLength}`,
      },
    ];
  }
  return [];
};

export const maxLength = (
  maxLength: number,
  customMessage: string | undefined = undefined
): Validator => (value, field) => {
  if (typeof value !== "string") {
    throw new Error(`[maxLength]: value is not of type string`);
  }
  if (value.length > maxLength) {
    return [
      {
        error: `Too long: ${value.length}/${maxLength}`,
        message:
          customMessage ?? `${field} is too long: ${value.length}/${maxLength}`,
      },
    ];
  }
  return [];
};

export const htmlRequired = (
  customMessage: string | undefined = undefined
): Validator => (value, field) => {
  if (typeof value !== "string") {
    throw new Error(`[maxLength]: value is not of type string`);
  }
  const el = document.createElement("div");
  el.innerHTML = value;
  if (!el.innerText.length) {
    return [
      { error: "Required", message: customMessage ?? `${field} is required` },
    ];
  }
  return [];
};

export const required = (
  customMessage: string | undefined = undefined
): Validator => (value, field) => {
  if (typeof value !== "string") {
    throw new Error(`[maxLength]: value is not of type string`);
  }
  if (!value.length) {
    return [
      { error: "Required", message: customMessage ?? `${field} is required` },
    ];
  }
  return [];
};
