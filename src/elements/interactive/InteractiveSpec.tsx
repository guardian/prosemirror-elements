import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { htmlMaxLength, htmlRequired } from "../../plugin/helpers/validation";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { undefinedDropdownValue } from "../helpers/transform";

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
    html: createTextField({ absentOnEmpty: true }),
    scriptUrl: createTextField(),
    scriptName: createTextField({ absentOnEmpty: true }),
    iframeUrl: createTextField({ absentOnEmpty: true }),
    originalUrl: createTextField(),
    source: createTextField({ absentOnEmpty: true }),
    isMandatory: createCustomField(true, true),
  };
};
