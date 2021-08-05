import React from "react";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createValidator, required } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CodeElementForm } from "./CodeElementForm";

export const codeFields = {
  codeText: createTextField({ isMultiline: true, rows: 11 }, true),
  language: createCustomField("Plain text", [
    { text: "Plain text", value: "Plain text" },
    { text: "HTML", value: "HTML" },
    { text: "CSS", value: "CSS" },
    { text: "JavaScript", value: "JavaScript" },
    { text: "Java", value: "Java" },
    { text: "Ruby", value: "Ruby" },
    { text: "Scala", value: "Scala" },
    { text: "YAML", value: "YAML" },
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
    language: "Plain text",
  }
);
