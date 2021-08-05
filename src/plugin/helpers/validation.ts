import type { FieldNameToValueMap } from "../fieldViews/helpers";
import type { FieldSpec } from "../types/Element";

type Validator = (fieldValue: unknown) => string[];

export const createValidator = (
  fieldValidationMap: Record<string, Validator[]>
) => <FSpec extends FieldSpec<string>>(
  fieldValues: FieldNameToValueMap<FSpec>
): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  for (const fieldName in fieldValidationMap) {
    const validators = fieldValidationMap[fieldName];
    const value = fieldValues[fieldName];
    const fieldErrors = validators.flatMap((validator) => validator(value));
    errors[fieldName] = fieldErrors;
  }
  return errors;
};

export const htmlMaxLength = (maxLength: number): Validator => (value) => {
  if (typeof value !== "string") {
    throw new Error(`[htmlMaxLength]: value is not of type string`);
  }
  const el = document.createElement("div");
  el.innerHTML = value;
  if (el.innerText.length > maxLength) {
    return [`Too long: ${el.innerText.length}/${maxLength}`];
  }
  return [];
};

export const maxLength = (maxLength: number): Validator => (value) => {
  if (typeof value !== "string") {
    throw new Error(`[maxLength]: value is not of type string`);
  }
  if (value.length > maxLength) {
    return [`Too long: ${value.length}/${maxLength}`];
  }
  return [];
};

export const htmlRequired = (): Validator => (value) => {
  if (typeof value !== "string") {
    throw new Error(`[maxLength]: value is not of type string`);
  }
  const el = document.createElement("div");
  el.innerHTML = value;
  if (!el.innerText.length) {
    return ["Required"];
  }
  return [];
};

export const required = (): Validator => (value) => {
  if (typeof value !== "string") {
    throw new Error(`[maxLength]: value is not of type string`);
  }
  if (!value.length) {
    return ["Required"];
  }
  return [];
};
