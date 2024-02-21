
import { useState } from "react";
import { useTyperighterAttrs } from "../../elements/helpers/typerighter";
import type {
  ErrorLevel,
  FieldValidationErrors,
  FieldValidator,
  ValidationError,
  Validator,
} from "../elementSpec";
import { createCustomDropdownField } from "../fieldViews/CustomFieldView";
import { createTextField } from "../fieldViews/TextFieldView";
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
  console.log("fielddesc", fieldDescriptions)

  function getValidators(nestedElementType: string) { 

    const pullquoteFields = {
      html: createTextField({
        rows: 4,
        validators: [
          required("Pullquote cannot be empty"),
          //To display a warning to users
          maxLength(120, undefined, "WARN"),
          //To prevent publication
          maxLength(1000, "Pullquote is too long", "ERROR"),
        ],
        absentOnEmpty: true,
        placeholder: "Enter a pull quote here…",
        attrs: useTyperighterAttrs,
      }),
      attribution: createTextField({
        absentOnEmpty: true,
        placeholder: "Enter attribution here…",
      }),
      role: createCustomDropdownField("supporting", [
        { text: "supporting (default)", value: "supporting" },
        { text: "inline", value: "inline" },
        { text: "showcase", value: "showcase" },
      ]),
    };

    if (nestedElementType === "pullquote") {
      return pullquoteFields
    }
  
  
  }

  const fieldErrors: FieldValidationErrors = {};
  console.log("fieldDescriptions", fieldDescriptions)
  console.log("fields", fields)
  if (fieldDescriptions.takeaways) {
    const numberOfTakeaways = fields.takeaways ? (fields.takeaways as any[]).length : 0
    console.log("numberOfTakeaways", numberOfTakeaways)
    const fieldToCheck = ["title", "content"]
    
    for (let i = 0; i < numberOfTakeaways; i++) {

      const numberOfNestedFieldsToValidate = (fields.takeaways as any[])[i]?.content.length
      console.log("numberOfNestedFieldsToValidate", numberOfNestedFieldsToValidate)
     for (const takeawayFieldName of fieldToCheck) {
      
      if (takeawayFieldName === 'title' || takeawayFieldName === 'content' && numberOfNestedFieldsToValidate === 0) {
      const value = (fields.takeaways as any[])[i]?.[takeawayFieldName];
      const takeawaysToValidate = fieldDescriptions.takeaways as unknown as FDesc
      const errors = validateValue(
        (takeawaysToValidate.fields as unknown as FDesc)[takeawayFieldName].validators,
        takeawayFieldName,
        value
      ) 
      
      fieldErrors[takeawayFieldName] = errors ;
      }

     else if (takeawayFieldName === 'content' && numberOfNestedFieldsToValidate > 0) {
      //   //get the correct validators for the elements in the content array
      //   //make sure you're passing the right fields as fieldname and value
        
      //if there is content in the takeaway body
      // 1) it's an array, so iterate through it - DONE
      // 2) find out what is the type of the element in the array (text, pullquote)
      // 3) get the validator for each field in the element
      // 4) validate value takes validator, fieldname (e.g. html for a pullquote), value (e.g. "this is a pullquote")

      
      for (let j = 0; j < numberOfNestedFieldsToValidate; j++) {
          const nestedFieldToValidate = (fields.takeaways as any[])[i]?.[takeawayFieldName][j]
        // 2) find out what is the type of the element in the array (text, pullquote)
        // the value of the nested field has assets, elementType and fields
        console.log("nestedFieldToValidate", nestedFieldToValidate)
        const validators = getValidators(nestedFieldToValidate.elementType) as unknown as FieldValidator[]
        console.log("validators", validators)
        

          for (const fieldName in fieldDescriptions) {
            const value = nestedFieldToValidate.fields[fieldName];
           
             if (fieldDescriptions[fieldName].validators) {
                const errors = validateValue(
                  validators,
                  fieldName,
                  value
                );
                console.log("break")
              fieldErrors[fieldName] = errors;
              }
            }}
      }
    
  }}}
  else {
    for (const fieldName in fieldDescriptions) {
    const value = fields[fieldName];
    console.log("fieldDescriptions", fieldDescriptions)
   
     if (fieldDescriptions[fieldName].validators) {
      const errors = validateValue(
        fieldDescriptions[fieldName].validators,
        fieldName,
        value
      );
      console.log("break")
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
  // console.log("trying to validate", validators, fieldName, value)
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
  // console.log("required check", "value is ", value, "; field is ", field)
  // console.log("typeof value", typeof value)
  // console.log('array from value', Array.from((value as any)))

  if (
    // field === "content" && 
    typeof value === "object" && Array.from((value as any)).length === 0
  ) {
    // console.log("content getting checked")
    return [
      {
        error: "Required",
        message: customMessage ?? `${field} is required`,
        level,
      },
    ];
  }

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
    // console.log("looking at length")
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
