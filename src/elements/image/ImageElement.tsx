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
import { ImageElementForm } from "./ImageElementForm";
import { largestAssetMinDimension } from "./imageElementValidation";

export type MediaPayload = {
  mediaId: string;
  mediaApiUri: string;
  assets: Asset[];
  suppliersReference: string;
  caption: string;
  photographer: string;
  source: string;
};

export type SetMedia = (mediaPayload: MediaPayload) => void;

export type Asset = {
  assetType: string;
  mimeType: string;
  url: string;
  fields: {
    width: number | string;
    height: number | string;
    isMaster: boolean | undefined;
  };
};

export type MainImageData = {
  mediaId?: string | undefined;
  mediaApiUri?: string | undefined;
  assets: Asset[];
  suppliersReference: string;
};

export type MainImageProps = {
  openImageSelector: (setMedia: SetMedia, mediaId?: string) => void;
  createCaptionPlugins?: (schema: Schema) => Plugin[];
};

export const undefinedDropdownValue = "none-selected";

export const minAssetValidation = largestAssetMinDimension(460);
export const thumbnailOption = {
  text: "thumbnail",
  value: "thumbnail",
};

export const createImageFields = ({
  createCaptionPlugins,
  openImageSelector,
}: MainImageProps) => {
  return {
    alt: createTextField({
      rows: 4,
      validators: [htmlMaxLength(1000), htmlRequired()],
      placeholder: "Enter some alt text…",
      isResizeable: true,
    }),
    caption: createFlatRichTextField({
      createPlugins: createCaptionPlugins,
      marks: "em strong link strike",
      validators: [htmlMaxLength(600, undefined, "WARN")],
      placeholder: "Enter a caption for this media…",
    }),
    displayCredit: createCustomField(true, true),
    imageType: createCustomField("Photograph", [
      { text: "Photograph", value: "Photograph" },
      { text: "Illustration", value: "Illustration" },
      { text: "Composite", value: "Composite" },
    ]),
    photographer: createTextField({
      validators: [htmlMaxLength(250)],
      placeholder: "Enter the photographer…",
    }),
    mainImage: createCustomField<MainImageData, MainImageProps>(
      {
        mediaId: undefined,
        mediaApiUri: undefined,
        assets: [],
        suppliersReference: "",
      },
      { openImageSelector },
      [minAssetValidation]
    ),
    source: createTextField({
      validators: [htmlMaxLength(250), htmlRequired()],
      placeholder: "Enter the source…",
    }),
    role: createCustomDropdownField(undefinedDropdownValue, [
      { text: "inline (default)", value: undefinedDropdownValue },
      { text: "supporting", value: "supporting" },
      { text: "showcase", value: "showcase" },
      thumbnailOption,
      { text: "immersive", value: "immersive" },
    ]),
  };
};

export const createImageElement = (props: MainImageProps) =>
  createReactElementSpec(
    createImageFields(props),
    ({ fields, errors, fieldValues }) => {
      return (
        <ImageElementForm
          fieldValues={fieldValues}
          errors={errors}
          fields={fields}
        />
      );
    }
  );
