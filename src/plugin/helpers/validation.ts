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

export const htmlMaxLength = (
  maxLength: number,
  customMessage: string | undefined = undefined
): Validator => (value, field) => {
  if (typeof value !== "string" && value !== undefined) {
    const typeError = `[htmlMaxLength]: value is not of type string`;
    return [
      {
        message: typeError,
        error: typeError,
      },
    ];
  }

  const el = document.createElement("div");
  el.innerHTML = value ?? "";
  const length = el.innerText.length;
  if (length > maxLength) {
    return [
      {
        error: `Too long: ${length}/${maxLength}`,
        message:
          customMessage ?? `${field} is too long: ${length}/${maxLength}`,
      },
    ];
  }
  return [];
};

export const maxLength = (
  maxLength: number,
  customMessage: string | undefined = undefined
): Validator => (value, field) => {
  if (typeof value !== "string" && value !== undefined) {
    const typeError = `[maxLength]: value is not of type string`;
    return [
      {
        message: typeError,
        error: typeError,
      },
    ];
  }
  const length = (value ?? "").length;
  if (length > maxLength) {
    return [
      {
        error: `Too long: ${length}/${maxLength}`,
        message:
          customMessage ?? `${field} is too long: ${length}/${maxLength}`,
      },
    ];
  }
  return [];
};

export const htmlRequired = (
  customMessage: string | undefined = undefined
): Validator => (value, field) => {
  if (typeof value !== "string" && value !== undefined) {
    const typeError = `[maxLength]: value is not of type string`;
    return [
      {
        message: typeError,
        error: typeError,
      },
    ];
  }
  const el = document.createElement("div");
  el.innerHTML = value ?? "";
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
  if (typeof value !== "string" && value !== undefined) {
    const typeError = `[maxLength]: value is not of type string`;
    return [
      {
        message: typeError,
        error: typeError,
      },
    ];
  }
  const length = (value ?? "").length;
  if (!length) {
    return [
      { error: "Required", message: customMessage ?? `${field} is required` },
    ];
  }
  return [];
};
