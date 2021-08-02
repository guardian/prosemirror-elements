import React from "react";
import { createCheckBox } from "../../plugin/fieldViews/CheckboxFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { EmbedElementForm } from "./EmbedForm";

export const createEmbedFields = () => {
  return {
    weighting: createTextField(),
    sourceUrl: createTextField(),
    embedCode: createTextField(),
    caption: createTextField(),
    altText: createTextField(),
    required: createCheckBox(false),
  };
};

export const createEmbedElement = <Name extends string>(name: Name) =>
  createReactElementSpec(
    name,
    createEmbedFields(),
    (fields, errors, __, fieldViewSpecs) => {
      return (
        <EmbedElementForm
          fields={fields}
          errors={errors}
          fieldViewSpecMap={fieldViewSpecs}
        />
      );
    },
    ({ altText }) => {
      const el = document.createElement("div");
      el.innerHTML = altText;
      return el.innerText ? null : { altText: ["Alt tag must be set"] };
    },
    {
      weighting: "",
      sourceUrl: "",
      embedCode: "",
      caption: "",
      altText: "",
      required: { value: false },
    }
  );
