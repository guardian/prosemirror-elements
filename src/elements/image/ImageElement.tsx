import { exampleSetup } from "prosemirror-example-setup";
import React from "react";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
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
    width: number;
    height: number;
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
};

export const createImageFields = (
  openImageSelector: (setMedia: SetMedia, mediaId?: string) => void
) => {
  return {
    altText: createTextField({
      rows: 2,
      validators: [htmlMaxLength(1000), htmlRequired()],
    }),
    caption: createFlatRichTextField({
      createPlugins: (schema) => exampleSetup({ schema }),
      nodeSpec: {
        marks: "em strong link strike",
      },
      validators: [htmlMaxLength(600)],
    }),
    displayCreditInformation: createCustomField(true, true),
    imageType: createCustomField("Photograph", [
      { text: "Photograph", value: "Photograph" },
      { text: "Illustration", value: "Illustration" },
      { text: "Composite", value: "Composite" },
    ]),
    photographer: createTextField({ validators: [htmlMaxLength(250)] }),
    mainImage: createCustomField<MainImageData, MainImageProps>(
      {
        mediaId: undefined,
        mediaApiUri: undefined,
        assets: [],
        suppliersReference: "",
      },
      { openImageSelector },
      [largestAssetMinDimension(460)]
    ),
    source: createTextField({
      validators: [htmlMaxLength(250), htmlRequired()],
    }),
    weighting: createCustomField("none-selected", [
      { text: "inline (default)", value: "none-selected" },
      { text: "supporting", value: "supporting" },
      { text: "showcase", value: "showcase" },
      { text: "thumbnail", value: "thumbnail" },
      { text: "immersive", value: "immersive" },
    ]),
  };
};

export const createImageElement = (
  openImageSelector: (setMedia: SetMedia, mediaId?: string) => void
) =>
  createReactElementSpec(
    createImageFields(openImageSelector),
    (fieldValues, errors, __, fields) => {
      return (
        <ImageElementForm
          fieldValues={fieldValues}
          errors={errors}
          fields={fields}
        />
      );
    }
  );
