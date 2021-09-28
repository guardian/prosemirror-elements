import type {
  FieldValidationErrors,
  FieldValidator,
  Validator,
} from "../elementSpec";
import type { FieldNameToValueMap } from "../fieldViews/helpers";
import type { FieldDescriptions } from "../types/Element";

export const createValidator = (
  fieldValidationMap: Record<string, FieldValidator[]>
) => <FDesc extends FieldDescriptions<string>>(
  fieldValues: Partial<FieldNameToValueMap<FDesc>>
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

export const validateWithFieldAndElementValidators = <
  FDesc extends FieldDescriptions<string>
>(
  fieldDescriptions: FDesc,
  validateElement: Validator<FDesc> | undefined = undefined
): Validator<FDesc> => (fields: Partial<FieldNameToValueMap<FDesc>>) => {
  const fieldErrors: FieldValidationErrors = {};
  for (const field in fieldDescriptions) {
    const value = fields[field];
    const validators = fieldDescriptions[field].validators;
    if (validators?.length) {
      fieldErrors[field] = [];
      validators.forEach((validate) => {
        const errors = validate(value, field);
        fieldErrors[field].push(...errors);
      });
    }
  }

  const elementErrors = validateElement ? validateElement(fields) : {};

  const allErrors = { ...fieldErrors, ...elementErrors };

  return Object.keys(allErrors).length > 0 ? allErrors : undefined;
};

export const htmlMaxLength = (
  maxLength: number,
  customMessage: string | undefined = undefined
): FieldValidator => (value, field) => {
  if (typeof value !== "string" && value !== undefined) {
    const typeError = `html max length check: ${field} value is incorrect`;
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
): FieldValidator => (value, field) => {
  if (typeof value !== "string" && value !== undefined) {
    const typeError = `max length check: ${field} value is incorrect`;
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
): FieldValidator => (value, field) => {
  if (typeof value !== "string" && value !== undefined) {
    const typeError = `required check: ${field} value is incorrect`;
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
): FieldValidator => (value, field) => {
  if (typeof value !== "string" && value !== undefined) {
    const typeError = `required check: ${field} value is incorrect`;
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
