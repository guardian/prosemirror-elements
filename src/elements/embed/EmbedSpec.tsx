import React from "react";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createDefaultRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import {
  createValidator,
  htmlMaxLength,
  htmlRequired,
  maxLength,
} from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { EmbedElementForm } from "./EmbedForm";

export const embedFields = {
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
  required: createCustomField(true, true),
};

export const createEmbedElement = () =>
  createReactElementSpec(
    embedFields,
    (fields, errors, __, fieldViewSpecs) => {
      return (
        <EmbedElementForm
          fields={fields}
          errors={errors}
          fieldViewSpecMap={fieldViewSpecs}
        />
      );
    },
    createValidator({
      altText: [htmlMaxLength(1000), htmlRequired()],
      embedCode: [htmlRequired()],
      caption: [maxLength(1000)],
    }),
    {
      weighting: "inline (default)",
      sourceUrl: "",
      embedCode: "",
      caption: "",
      altText: "",
      required: true,
    }
  );
