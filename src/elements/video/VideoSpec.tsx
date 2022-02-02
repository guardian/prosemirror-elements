import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import React from "react";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { htmlMaxLength } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { undefinedDropdownValue } from "../helpers/transform";
import { VideoForm } from "./VideoForm";

export const createVideoFields = (
  createCaptionPlugins: (schema: Schema) => Plugin[]
) => {
  return {
    source: createTextField(),
    isMandatory: createCustomField(true, true),
    role: createCustomDropdownField(undefinedDropdownValue, [
      { text: "inline (default)", value: undefinedDropdownValue },
      { text: "supporting", value: "supporting" },
      { text: "showcase", value: "showcase" },
      { text: "immersive", value: "immersive" },
    ]),
    url: createTextField(),
    description: createTextField(),
    originalUrl: createTextField(),
    height: createTextField(),
    caption: createFlatRichTextField({
      createPlugins: createCaptionPlugins,
      marks: "em strong link strike",
      validators: [htmlMaxLength(1000, undefined, "WARN")],
      placeholder: "Enter a caption for this media…",
      absentOnEmpty: true,
    }),
    title: createTextField(),
    html: createTextField(),
    width: createTextField(),
    authorName: createTextField(),
  };
};

export type VideoElementOptions = {
  createCaptionPlugins: (schema: Schema) => Plugin[];
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
};

export const createVideoElement = ({
  createCaptionPlugins,
  checkThirdPartyTracking,
}: VideoElementOptions) =>
  createReactElementSpec(
    createVideoFields(createCaptionPlugins),
    ({ fields, errors, fieldValues }) => {
      return (
        <VideoForm
          fields={fields}
          errors={errors}
          fieldValues={fieldValues}
          checkThirdPartyTracking={checkThirdPartyTracking}
        />
      );
    }
  );
