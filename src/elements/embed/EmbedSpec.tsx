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
    rows: 2,
    isCode: true,
    validators: [htmlRequired()],
  }),
  caption: createDefaultRichTextField([maxLength(1000)]),
  altText: createTextField({
    rows: 2,
    validators: [htmlMaxLength(1000), htmlRequired()],
  }),
  required: createCustomField(true, true),
};

export const createEmbedElement = () =>
  createReactElementSpec(embedFields, ({ fields, errors, fieldValues }) => {
    return (
      <EmbedElementForm
        fields={fields}
        errors={errors}
        fieldValues={fieldValues}
      />
    );
  });
