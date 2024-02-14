import type {
  ErrorLevel,
  FieldValidationErrors,
  FieldValidator,
  ValidationError,
  Validator,
} from "../elementSpec";
import type { FieldDescriptions } from "../types/Element";
import { undefinedDropdownValue } from "./constants";
import type { FieldNameToValueMap } from "./fieldView";

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
  console.log("fieldDescriptions", fieldDescriptions)
  console.log("fields", fields)
  if (fieldDescriptions.takeaways) {
    const numberOfTakeaways = fields.takeaways ? (fields.takeaways as any[]).length : 0
    const fieldToCheck = ["title", "content"]
    for (let i = 0; i < numberOfTakeaways; i++) {
     
     for (const fieldName of fieldToCheck) {
      console.log("fieldName", fieldName)
      const value = (fields.takeaways as any[])[i]?.[fieldName];
      const takeawaysToValidate = fieldDescriptions.takeaways as unknown as FDesc
      console.log("validator thing for fieldname", fieldName, takeawaysToValidate[fieldName])
      console.log("validator def", takeawaysToValidate.fields)
      console.log("validator def", (takeawaysToValidate.fields as unknown as FDesc)[fieldName].validators)
      const errors = validateValue(
        // (takeawaysToValidate.fields as unknown as FDesc)[fieldName].validators,
        (takeawaysToValidate.fields as unknown as FDesc)[fieldName].validators,
        fieldName,
        value
      );
      console.log("errors", errors)
    fieldErrors[fieldName] = errors;
      console.log("fieldErrors", fieldErrors)
    
  }}}
  else {
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
  }}

  const elementErrors = validateElement ? validateElement(fields) : {};

  const allErrors = { ...fieldErrors, ...elementErrors };

  return Object.keys(allErrors).length > 0 ? allErrors : undefined;
};

export const validateValue = (
  validators: FieldValidator[] | undefined,
  fieldName: string,
  value: unknown
): ValidationError[] => {
  console.log("trying to validate", validators, fieldName, value)
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
  console.log("required check", "value is ", value, "; field is ", field)
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
    console.log("looking at length")
    return [
      {
        error: "Required",
        message: customMessage ?? `${field} is required`,
        level,
      },
    ];
  }
  if (
    field === "content" &&
    value === '<div class="textElement"><p></p></div>'
  ) {
    console.log("content getting checked")
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

export const dropDownRequired = (
  customMessage: string | undefined = undefined,
  level: ErrorLevel = "ERROR"
): FieldValidator => (value, field) => {
  if (value === undefinedDropdownValue) {
    return [
      {
        error: "Required",
        message: customMessage ?? `${field} is required`,
        level,
      },
    ];
  } else {
    return [];
  }
};

export const numbersOnly = (
  customMessage: string | undefined = undefined,
  level: ErrorLevel = "ERROR"
): FieldValidator => (value) => {
  const reg = new RegExp("^[0-9]*$");
  if (typeof value === "string" && !reg.test(value)) {
    return [
      {
        error: "Numbers only",
        message: customMessage ?? `Only numbers are permitted`,
        level,
      },
    ];
  }
  return [];
};

export const validHexidecimalValue = (
  customMessage: string | undefined = undefined,
  level: ErrorLevel = "ERROR"
): FieldValidator => (value) => {
  const reg = new RegExp("^(?:[0-9a-fA-F]{3}){1,2}$");
  if (typeof value === "string" && !reg.test(value) && value !== "") {
    return [
      {
        error: "Not a valid colour value",
        message: customMessage ?? `Must be a valid colour value`,
        level,
      },
    ];
  }
  return [];
};
