import type { FieldValidationErrors, ValidationError } from "../elementSpec";
import type { FieldNameToValueMap } from "../fieldViews/helpers";
import type { FieldDescriptions } from "../types/Element";

export type Validator = (
  fieldValue: unknown,
  fieldName: string
) => ValidationError[];

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
