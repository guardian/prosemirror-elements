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
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { undefinedDropdownValue } from "../helpers/transform";
import { InteractiveElementForm } from "./InteractiveForm";

export type MainInteractiveProps = {
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
  createCaptionPlugins?: (schema: Schema) => Plugin[];
};

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
    scriptName: createTextField(),
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
          checkThirdPartyTracking={props.checkThirdPartyTracking}
        />
      );
    }
  );
