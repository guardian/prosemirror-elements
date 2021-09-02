import React from "react";
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createValidator, required } from "../../plugin/helpers/validation";
import { createGuElementSpec } from "../createGuElementSpec";
import { CodeElementForm } from "./CodeElementForm";

export const codeFields = {
  html: createTextField({ isMultiline: true, rows: 4 }, true),
  language: createCustomDropdownField("text", [
    { text: "Plain text", value: "text" },
    { text: "HTML", value: "html" },
    { text: "CSS", value: "css" },
    { text: "JavaScript", value: "javascript" },
    { text: "Java", value: "java" },
    { text: "Ruby", value: "ruby" },
    { text: "Scala", value: "scala" },
    { text: "YAML", value: "yaml" },
  ]),
};

export const codeElement = createGuElementSpec(
  codeFields,
  (_, errors, __, fields) => {
    return <CodeElementForm errors={errors} fields={fields} />;
  },
  createValidator({ html: [required()] })
);
