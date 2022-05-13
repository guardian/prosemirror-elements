import type {
  ErrorLevel,
  FieldValidationErrors,
  FieldValidator,
  ValidationError,
  Validator,
} from "../elementSpec";
import type { FieldNameToValueMap } from "../helpers/fieldView";
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
  for (const fieldName in fieldDescriptions) {
    const value = fields[fieldName];
    if (fieldDescriptions[fieldName].validators) {
      const errors = validateValue(
        fieldDescriptions[fieldName].validators,
        fieldName,
        value
      );
      fieldErrors[fieldName] = errors;
    }
  }

  const elementErrors = validateElement ? validateElement(fields) : {};

  const allErrors = { ...fieldErrors, ...elementErrors };

  return Object.keys(allErrors).length > 0 ? allErrors : undefined;
};

export const validateValue = (
  validators: FieldValidator[] | undefined,
  fieldName: string,
  value: unknown
): ValidationError[] => {
  const errors = [] as ValidationError[];

  if (validators?.length) {
    validators.forEach((validate) =>
      errors.push(...validate(value, fieldName))
    );
  }

  return errors;
};

export const htmlMaxLength = (
  maxLength: number,
  customMessage: string | undefined = undefined,
  level: ErrorLevel = "ERROR"
): FieldValidator => (value, field) => {
  if (typeof value !== "string" && value !== undefined) {
    const typeError = `html max length check: ${field} value is incorrect`;
    return [
      {
        message: typeError,
        error: typeError,
        level,
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
        level,
      },
    ];
  }
  return [];
};

export const maxLength = (
  maxLength: number,
  customMessage: string | undefined = undefined,
  level: ErrorLevel = "ERROR"
): FieldValidator => (value, field) => {
  if (typeof value !== "string" && value !== undefined) {
    const typeError = `max length check: ${field} value is incorrect`;
    return [
      {
        message: typeError,
        error: typeError,
        level,
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
        level,
      },
    ];
  }
  return [];
};

export const htmlRequired = (
  customMessage: string | undefined = undefined,
  level: ErrorLevel = "ERROR"
): FieldValidator => (value, field) => {
  if (typeof value !== "string" && value !== undefined) {
    const typeError = `required check: ${field} value is incorrect`;
    return [
      {
        message: typeError,
        error: typeError,
        level,
      },
    ];
  }
  const el = document.createElement("div");
  el.innerHTML = value ?? "";
  if (!el.innerText.length) {
    return [
      {
        error: "Required",
        message: customMessage ?? `${field} is required`,
        level,
      },
    ];
  }
  return [];
};

export const required = (
  customMessage: string | undefined = undefined,
  level: ErrorLevel = "ERROR"
): FieldValidator => (value, field) => {
  if (typeof value !== "string" && value !== undefined) {
    const typeError = `required check: ${field} value is incorrect`;
    return [
      {
        message: typeError,
        error: typeError,
        level,
      },
    ];
  }
  const length = (value ?? "").length;
  if (!length) {
    return [
      {
        error: "Required",
        message: customMessage ?? `${field} is required`,
        level,
      },
    ];
  }
  return [];
};
