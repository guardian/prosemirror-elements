import React from "react";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CodeElementForm } from "./CodeElementForm";

export const createCodeFields = () => {
  return {
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
};

export const createCodeElement = () =>
  createReactElementSpec(
    createCodeFields(),
    (_, errors, __, fieldViewSpecs) => {
      return (
        <CodeElementForm errors={errors} fieldViewSpecs={fieldViewSpecs} />
      );
    },
    ({ codeText }) => {
      const el = document.createElement("div");
      el.innerHTML = codeText;
      return el.innerText ? null : { altText: ["Alt tag must be set"] };
    },
    {
      codeText: "",
      language: "Plain text",
    }
  );
