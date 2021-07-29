import React from "react";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CodeElementForm } from "./CodeElement";

export const createCodeFields = () => {
  return {
    code: createTextField({ isMultiline: true, rows: 2 }, true),
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
};

export const createCodeElement = <Name extends string>(name: Name) =>
  createReactElementSpec(
    name,
    createCodeFields(),
    (fields, errors, __, fieldViewSpecs) => {
      return (
        <CodeElementForm
          fields={fields}
          errors={errors}
          fieldViewSpecMap={fieldViewSpecs}
        />
      );
    },
    ({ code }) => {
      const el = document.createElement("div");
      el.innerHTML = code;
      return el.innerText ? null : { altText: ["Alt tag must be set"] };
    },
    {
      code: "",
      language: "Plain text",
    }
  );
