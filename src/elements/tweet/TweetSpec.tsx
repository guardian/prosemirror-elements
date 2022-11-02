import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import { htmlMaxLength } from "../../plugin/helpers/validation";
import type { Asset } from "../helpers/defaultTransform";

export const createTweetFields = (
  createCaptionPlugins?: (schema: Schema) => Plugin[]
) => {
  return {
    source: createTextField({ absentOnEmpty: true }),
    isMandatory: createCustomField(true, true),
    role: createCustomDropdownField(undefinedDropdownValue, [
      { text: "inline (default)", value: undefinedDropdownValue },
      { text: "supporting", value: "supporting" },
      { text: "showcase", value: "showcase" },
      { text: "thumbnail", value: "thumbnail" },
      { text: "immersive", value: "immersive" },
    ]),
    url: createTextField({ absentOnEmpty: true }),
    originalUrl: createTextField({ absentOnEmpty: true }),
    id: createTextField({ absentOnEmpty: true }),
    // This caption field is redundant as it never surfaces downstream in CAPI, but we are keeping it here to preserve old elements
    caption: createFlatRichTextField({
      createPlugins: createCaptionPlugins,
      marks: "em strong link strike",
      validators: [htmlMaxLength(1000, undefined, "WARN")],
      placeholder: "Enter a caption for this media…",
      absentOnEmpty: true,
    }),
    html: createTextField({ absentOnEmpty: true }),
    authorName: createTextField({ absentOnEmpty: true }),
    hideMedia: createTextField({ absentOnEmpty: true }),
    hideThread: createTextField({ absentOnEmpty: true }),
    assets: createCustomField<Asset[]>([], undefined),
  };
};
