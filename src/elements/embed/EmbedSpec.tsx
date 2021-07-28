import React from "react";
import { createCheckBox } from "../../plugin/fieldViews/CheckboxFieldView";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createDefaultRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { EmbedElementForm } from "./EmbedForm";

export const createEmbedFields = () => {
  return {
    weighting: createCustomField("inline", [
      { text: "inline (default)", value: "inline" },
      { text: "supporting", value: "supporting" },
      { text: "showcase", value: "showcase" },
      { text: "thumbnail", value: "thumbnail" },
      { text: "immersive", value: "immersive" },
    ]),
    sourceUrl: createTextField(),
    embedCode: createTextField({ isMultiline: true, rows: 2 }, true),
    caption: createDefaultRichTextField(),
    altText: createTextField({ isMultiline: true, rows: 2 }),
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
      weighting: "inline (default)",
      sourceUrl: "",
      embedCode: "",
      caption: "",
      altText: "",
      required: { value: false },
    }
  );
