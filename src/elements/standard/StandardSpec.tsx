import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { htmlMaxLength } from "../../plugin/helpers/validation";
import type { Asset } from "../helpers/defaultTransform";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { undefinedDropdownValue } from "../helpers/transform";

/**
 * A standard element represents every element covered by
 * https://github.com/guardian/flexible-model/blob/f9d30ad2bb19446a9226ab1bd8418b4aaa03d762/src/main/thrift/content.thrift#L696.
 *
 * In practice, it also covers the legacy (non-content-atom) audio and video elements,
 * which only use a subset of their flexible-model fields.
 */
export const createStandardFields = (
  createCaptionPlugins?: (schema: Schema) => Plugin[],
  hasThumbnailRole = true
) => {
  const roles = [
    { text: "inline (default)", value: undefinedDropdownValue },
    { text: "supporting", value: "supporting" },
    { text: "showcase", value: "showcase" },
    { text: "immersive", value: "immersive" },
  ];

  if (hasThumbnailRole) {
    roles.push({ text: "thumbnail", value: "thumbnail" });
  }

  return {
    source: createTextField({ absentOnEmpty: true }),
    isMandatory: createCustomField(true, true),
    role: createCustomDropdownField(undefinedDropdownValue, roles),
    url: createTextField({ absentOnEmpty: true }),
    description: createTextField({ absentOnEmpty: true }),
    originalUrl: createTextField({ absentOnEmpty: true }),
    height: createTextField({ absentOnEmpty: true }),
    caption: createFlatRichTextField({
      createPlugins: createCaptionPlugins,
      marks: "em strong link strike",
      validators: [htmlMaxLength(1000, undefined, "WARN")],
      placeholder: "Enter a caption for this media…",
      absentOnEmpty: true,
    }),
    title: createTextField({ absentOnEmpty: true }),
    html: createTextField({ absentOnEmpty: true }),
    width: createTextField({ absentOnEmpty: true }),
    authorName: createTextField({ absentOnEmpty: true }),
    assets: createCustomField<Asset[]>([], undefined),
  };
};

export type StandardElementOptions = {
  createCaptionPlugins?: (schema: Schema) => Plugin[];
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
  useLargePreview?: boolean;
  hasThumbnailRole?: boolean;
};
