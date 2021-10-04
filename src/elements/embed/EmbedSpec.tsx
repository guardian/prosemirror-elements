import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import React from "react";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { htmlMaxLength, htmlRequired } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { EmbedElementForm } from "./EmbedForm";

export type MainEmbedProps = {
  embedHtml?: string;
  createCaptionPlugins?: (schema: Schema) => Plugin[];
};

export const createEmbedFields = ({
  embedHtml,
  createCaptionPlugins,
}: MainEmbedProps) => {
  return {
    weighting: createCustomDropdownField("inline", [
      { text: "inline (default)", value: "inline" },
      { text: "supporting", value: "supporting" },
      { text: "showcase", value: "showcase" },
      { text: "thumbnail", value: "thumbnail" },
      { text: "immersive", value: "immersive" },
    ]),
    sourceUrl: createTextField({
      placeholder: "Enter the source URL for this embed…",
    }),
    embedCode: createTextField({
      rows: 2,
      isCode: true,
      validators: [htmlRequired()],
      placeholder: "Paste in the embed code…",
    }),
    caption: createRichTextField({
      createPlugins: createCaptionPlugins,
      marks: "em strong link strike",
      validators: [htmlMaxLength(1000)],
      placeholder: "Enter a caption for this media…",
    }),
    altText: createTextField({
      rows: 2,
      validators: [htmlMaxLength(1000), htmlRequired()],
      placeholder: "Enter some alt text…",
    }),
    required: createCustomField(true, true),
  };
};

export const createEmbedElement = (props: MainEmbedProps) =>
  createReactElementSpec(
    createEmbedFields(props),
    ({ fields, errors, fieldValues }) => {
      return (
        <EmbedElementForm
          fields={fields}
          errors={errors}
          fieldValues={fieldValues}
        />
      );
    }
  );
