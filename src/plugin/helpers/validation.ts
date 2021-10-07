import type {
  ErrorLevel,
  FieldValidationErrors,
  FieldValidator,
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
  const strWithoutHtml = removeHTMLFromStr(value);
  const length = strWithoutHtml.length;
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
  const strWithoutHtml = removeHTMLFromStr(value);
  if (!strWithoutHtml.length) {
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

const removeHTMLFromStr = (str: string | undefined) => {
  // At the moment, we don't remove HTML – it's proved too costly to strip
  // html with .innerHTML parsing on the fly in large documents. If we find
  // a fast solution, we can revisit this.
  return str ?? "";
};
