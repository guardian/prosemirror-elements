import { exampleSetup } from "prosemirror-example-setup";
import React from "react";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import type { Validator } from "../../plugin/helpers/validation";
import {
  createValidator,
  htmlMaxLength,
  htmlRequired,
} from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { ImageElementForm } from "./ImageElementForm";

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
    altText: createTextField({ isMultiline: true, rows: 2 }),
    caption: createFlatRichTextField({
      createPlugins: (schema) => exampleSetup({ schema }),
      nodeSpec: {
        marks: "em strong link strike",
      },
    }),
    displayCreditInformation: createCustomField(true, true),
    imageType: createCustomField("Photograph", [
      { text: "Photograph", value: "Photograph" },
      { text: "Illustration", value: "Illustration" },
      { text: "Composite", value: "Composite" },
    ]),
    photographer: createTextField(),
    mainImage: createCustomField<MainImageData, MainImageProps>(
      {
        mediaId: undefined,
        mediaApiUri: undefined,
        assets: [],
        suppliersReference: "",
      },
      { openImageSelector }
    ),
    source: createTextField(),
    weighting: createCustomField("none-selected", [
      { text: "inline (default)", value: "none-selected" },
      { text: "supporting", value: "supporting" },
      { text: "showcase", value: "showcase" },
      { text: "thumbnail", value: "thumbnail" },
      { text: "immersive", value: "immersive" },
    ]),
  };
};

type ImageAsset = {
  fields: {
    width: number;
    height: number;
  };
};

const hasOwnProperty = <X extends Record<string, unknown>, Y extends string>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> => {
  return Object.hasOwnProperty.call(obj, prop);
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isValidImageAsset = (
  maybeImage: Record<string, unknown>
): maybeImage is ImageAsset => {
  return (
    hasOwnProperty(maybeImage, "fields") &&
    isRecord(maybeImage.fields) &&
    hasOwnProperty(maybeImage.fields, "width") &&
    hasOwnProperty(maybeImage.fields, "height") &&
    typeof maybeImage.fields.width === "number" &&
    typeof maybeImage.fields.height === "number"
  );
};

const validateAssets = (maybeAssets: unknown[]) => {
  const assets = maybeAssets.map((asset, i) => {
    if (!isRecord(asset)) {
      throw new Error(
        `[largestAssetMinDimension]: asset ${i} passed to validator was not an object`
      );
    }
    if (!isValidImageAsset(asset)) {
      throw new Error(
        `[largestAssetMinDimension]: asset ${i} does not have height and width props that are numbers`
      );
    }
    return asset;
  });
  return assets;
};

export const largestAssetMinDimension = (minSize: number): Validator => (
  value
) => {
  if (typeof value !== "object" || value === null) {
    throw new Error(
      `[largestAssetMinDimension]: overall value passed to validator is not an object`
    );
  }

  if (isRecord(value) && value.assets && Array.isArray(value.assets)) {
    const validatedAssets = validateAssets(value.assets);
    const largestImageAsset = validatedAssets.sort(function (a, b) {
      return b.fields.width - a.fields.width;
    })[0];

    const largestDimensionMin = minSize;

    if (
      largestImageAsset.fields.width < largestDimensionMin &&
      largestImageAsset.fields.height < largestDimensionMin
    ) {
      return [
        {
          error: "Warning: Small image, only thumbnail available",
          message:
            "Image should be greater than 460 x 460px for uses other than a thumbnail.",
        },
      ];
    }
  }

  return [];
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
    },
    createValidator({
      caption: [htmlMaxLength(600)],
      altText: [htmlMaxLength(1000), htmlRequired()],
      source: [htmlMaxLength(250), htmlRequired()],
      photographer: [htmlMaxLength(250)],
      mainImage: [largestAssetMinDimension(460)],
    })
  );
