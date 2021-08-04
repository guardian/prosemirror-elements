import type { FieldNameToValueMap } from "../fieldViews/helpers";
import type { FieldSpec } from "../types/Element";

type Validator = (fieldValue: string) => string[];

export const buildValidator = (
  fieldValidationMap: Record<string, Validator[]>
) => <FSpec extends FieldSpec<string>>(
  fieldValues: FieldNameToValueMap<FSpec>
): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  for (const fieldName in fieldValidationMap) {
    const validators = fieldValidationMap[fieldName];
    const value = fieldValues[fieldName];
    // We've got a field name, and a list of validators
    // Let's append any errors these validators produce to the errors object
    const fieldErrors = validators.flatMap((validator) => validator(value));
    errors[fieldName] = fieldErrors;
  }
  return errors;
};

export const maxLength = (maxLength: number): Validator => (value) => {
  const el = document.createElement("div");
  el.innerHTML = value;
  if (el.innerText.length > maxLength) {
    return [`Too long: ${el.innerText.length}/${maxLength}`];
  }
  return [];
};

export const required = (): Validator => (value) => {
  const el = document.createElement("div");
  el.innerHTML = value;
  if (!el.innerText.length) {
    return ["Required"];
  }
  return [];
};

// What happens when we're dealing with different element types, for example, RichText vs Text
// need a different treatment for their data types. Can we pass in the Field declaration to have
// them do the right thing, contextually.

// We've got a typeerror! Can we fix it?
