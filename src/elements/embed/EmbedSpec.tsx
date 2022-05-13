import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import React from "react";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import {
  htmlMaxLength,
  maxLength,
  required,
} from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { parseHtml } from "../helpers/html";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { undefinedDropdownValue } from "../helpers/transform";
import { Callout } from "./Callout";
import type { TwitterUrl, YoutubeUrl } from "./embedComponents/embedUtils";
import { EmbedForm } from "./EmbedForm";

export type MainEmbedProps = {
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
  convertYouTube: (src: YoutubeUrl) => void;
  convertTwitter: (src: TwitterUrl) => void;
  createCaptionPlugins?: (schema: Schema) => Plugin[];
  targetingUrl: string;
};

export const getCalloutTag = (html: string) => {
  const element = parseHtml(html);
  if (element) {
    const tagName = element.getAttribute("data-callout-tagname");

    if (tagName) {
      return tagName;
    }
  }
  return undefined;
};

export const createEmbedFields = ({ createCaptionPlugins }: MainEmbedProps) => {
  return {
    role: createCustomDropdownField(undefinedDropdownValue, [
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
      isResizeable: true,
      isMultiline: true,
      validators: [required(undefined, "WARN")],
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
      isResizeable: true,
      validators: [maxLength(1000), required()],
      placeholder: "Enter some alt text…",
    }),
    isMandatory: createCustomField(true, true),
  };
};

export const createEmbedElement = (props: MainEmbedProps) =>
  createReactElementSpec(createEmbedFields(props), ({ fields }) => {
    const calloutTag = getCalloutTag(fields.html.value);
    return calloutTag ? (
      <Callout tag={calloutTag} targetingUrl={props.targetingUrl} />
    ) : (
      <EmbedForm
        fields={fields}
        checkThirdPartyTracking={props.checkThirdPartyTracking}
        convertYouTube={props.convertYouTube}
        convertTwitter={props.convertTwitter}
      />
    );
  });
