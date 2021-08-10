import React from "react";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createValidator, required } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CodeElementForm } from "./CodeElementForm";

export const codeFields = {
  codeText: createTextField({ isMultiline: true, rows: 11 }, true),
  language: createCustomField("text", [
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

export const codeElement = createReactElementSpec(
  codeFields,
  (_, errors, __, fieldViewSpecs) => {
    return <CodeElementForm errors={errors} fieldViewSpecs={fieldViewSpecs} />;
  },
  createValidator({ codeText: [required()] }),
  {
    codeText: "",
    language: "text",
  }
);
