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
import type { EmbedStatus } from "../helpers/ThirdPartyStatusChecks";
import { InteractiveElementForm } from "./InteractiveForm";

export type MainInteractiveProps = {
  checkThirdPartyTracking: (html: string) => Promise<EmbedStatus>;
  createCaptionPlugins?: (schema: Schema) => Plugin[];
};

export const undefinedDropdownValue = "none-selected";

// iframeUrl: "https://interactive.guim.co.uk/maps/embed/may/2021-05-26T15:18:36.html",
// scriptName: "iframe-wrapper",
// source: "Guardian",
// isMandatory: "true",
// role: "supporting",
// originalUrl: "https://interactive.guim.co.uk/maps/embed/may/2021-05-26T15:18:36.html",
// scriptUrl: "https://interactive.guim.co.uk/embed/iframe-wrapper/0.1/boot.js",
// alt: "dsa",
// caption: "dsa",
// html: "<a href="https://interactive.guim.co.uk/maps/embed/may/2021-05-26T15:18:36.htmnteractive.guim.co.uk/maps/embed/may/2021-05-26T15:18:36.html">Interactive</a>"

export const createInteractiveFields = ({
  createCaptionPlugins,
}: MainInteractiveProps) => {
  return {
    role: createCustomDropdownField("inline", [
      { text: "inline (default)", value: undefinedDropdownValue },
      { text: "supporting", value: "supporting" },
      { text: "showcase", value: "showcase" },
      { text: "thumbnail", value: "thumbnail" },
      { text: "immersive", value: "immersive" },
    ]),
    caption: createFlatRichTextField({
      createPlugins: createCaptionPlugins,
      marks: "em strong link strike",
      validators: [htmlMaxLength(1000, undefined, "WARN")],
      placeholder: "Enter a caption for this media…",
    }),
    alt: createTextField({
      rows: 2,
      isResizeable: true,
      validators: [htmlMaxLength(1000), htmlRequired()],
      placeholder: "Enter some alt text…",
    }),
    html: createTextField(),
    scriptUrl: createTextField(),
    iframeUrl: createTextField(),
    originalUrl: createTextField(),
    source: createTextField(),
    isMandatory: createCustomField(true, true),
  };
};

export const createInteractiveElement = (props: MainInteractiveProps) =>
  createReactElementSpec(
    createInteractiveFields(props),
    ({ fields, errors, fieldValues }) => {
      return (
        <InteractiveElementForm
          fields={fields}
          errors={errors}
          fieldValues={fieldValues}
          checkEmbedTracking={props.checkThirdPartyTracking}
        />
      );
    }
  );
