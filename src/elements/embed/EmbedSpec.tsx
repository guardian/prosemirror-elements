import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import React from "react";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { htmlMaxLength, htmlRequired } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import type { EmbedStatus } from "./embedComponents/EmbedStatusChecks";
import { EmbedElementForm } from "./EmbedForm";

export type MainEmbedProps = {
  checkEmbedTracking: (html: string) => Promise<EmbedStatus>;
  convertYouTube: (src: string) => void;
  convertTwitter: (src: string) => void;
  createCaptionPlugins?: (schema: Schema) => Plugin[];
};

export const undefinedDropdownValue = "none-selected";

export const createEmbedFields = ({ createCaptionPlugins }: MainEmbedProps) => {
  return {
    role: createCustomDropdownField("inline", [
      { text: "inline (default)", value: undefinedDropdownValue },
      { text: "supporting", value: "supporting" },
      { text: "showcase", value: "showcase" },
      { text: "thumbnail", value: "thumbnail" },
      { text: "immersive", value: "immersive" },
    ]),
    url: createTextField({
      placeholder: "Enter the source URL for this embed…",
    }),
    html: createTextField({
      rows: 2,
      isCode: true,
      maxRows: 10,
      isMultiline: true,
      validators: [htmlRequired(undefined, "WARN")],
      placeholder: "Paste in the embed code…",
    }),
    caption: createFlatRichTextField({
      createPlugins: createCaptionPlugins,
      marks: "em strong link strike",
      validators: [htmlMaxLength(1000, undefined, "WARN")],
      placeholder: "Enter a caption for this media…",
    }),
    alt: createTextField({
      rows: 2,
      validators: [htmlMaxLength(1000), htmlRequired()],
      placeholder: "Enter some alt text…",
    }),
    isMandatory: createCustomField(true, true),
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
          checkEmbedTracking={props.checkEmbedTracking}
          convertYouTube={props.convertYouTube}
          convertTwitter={props.convertTwitter}
        />
      );
    }
  );
