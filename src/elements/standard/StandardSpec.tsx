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
import type { Asset } from "../helpers/defaultTransform";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { undefinedDropdownValue } from "../helpers/transform";
import { StandardForm } from "./StandardForm";

/**
 * A standard element represents every element covered by
 * https://github.com/guardian/flexible-model/blob/f9d30ad2bb19446a9226ab1bd8418b4aaa03d762/src/main/thrift/content.thrift#L696.
 *
 * In practice, it also covers the legacy (non-content-atom) audio and video elements,
 * which only use a subset of their flexible-model fields.
 */
export const createStandardFields = (
  createCaptionPlugins?: (schema: Schema) => Plugin[]
) => {
  return {
    source: createTextField({ absentOnEmpty: true }),
    isMandatory: createCustomField(true, true),
    role: createCustomDropdownField(undefinedDropdownValue, [
      { text: "inline (default)", value: undefinedDropdownValue },
      { text: "supporting", value: "supporting" },
      { text: "showcase", value: "showcase" },
      { text: "immersive", value: "immersive" },
    ]),
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
};

export const createStandardElement = ({
  createCaptionPlugins,
  checkThirdPartyTracking,
}: StandardElementOptions) =>
  createReactElementSpec(
    createStandardFields(createCaptionPlugins),
    ({ fields, errors, fieldValues }) => {
      return (
        <StandardForm
          fields={fields}
          errors={errors}
          fieldValues={fieldValues}
          checkThirdPartyTracking={checkThirdPartyTracking}
        />
      );
    }
  );
