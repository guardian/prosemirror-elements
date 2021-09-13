import React from "react";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createDefaultRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import {
  htmlMaxLength,
  htmlRequired,
  maxLength,
} from "../../plugin/helpers/validation";
import { createGuElementSpec } from "../createGuElementSpec";
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
  caption: createDefaultRichTextField([maxLength(1000)]),
  altText: createTextField({
    multilineOptions: { isMultiline: true, rows: 2 },
    validators: [htmlMaxLength(1000), htmlRequired()],
  }),
  required: createCustomField(true, true),
};

export const createEmbedElement = () =>
  createGuElementSpec(embedFields, (fieldValues, errors, __, fields) => {
    return (
      <EmbedElementForm
        fields={fields}
        errors={errors}
        fieldValues={fieldValues}
      />
    );
  });
