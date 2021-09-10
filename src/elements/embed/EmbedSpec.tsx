import React from "react";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
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
  weighting: createCustomDropdownField("inline", [
    { text: "inline (default)", value: "inline" },
    { text: "supporting", value: "supporting" },
    { text: "showcase", value: "showcase" },
    { text: "thumbnail", value: "thumbnail" },
    { text: "immersive", value: "immersive" },
  ]),
  sourceUrl: createTextField(),
  embedCode: createTextField({
    multilineOptions: { isMultiline: true, rows: 2 },
    isCode: true,
    validators: [htmlRequired()],
  }),
  caption: createDefaultRichTextField(),
  altText: createTextField({
    multilineOptions: { isMultiline: true, rows: 2 },
    validators: [htmlMaxLength(1000), htmlRequired()],
  }),
  required: createCustomField(true, true),
};

export const createEmbedElement = () =>
  createReactElementSpec(
    embedFields,
    (fieldValues, errors, __, fields) => {
      return (
        <EmbedElementForm
          fields={fields}
          errors={errors}
          fieldValues={fieldValues}
        />
      );
    },
    createValidator({
      caption: [maxLength(1000)],
    })
  );
