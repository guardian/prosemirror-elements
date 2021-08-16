import { exampleSetup } from "prosemirror-example-setup";
import React from "react";
import { createCheckBox } from "../../plugin/fieldViews/CheckboxFieldView";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createDropDownField } from "../../plugin/fieldViews/DropdownFieldView";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
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
    altText: createTextField(),
    caption: createFlatRichTextField({
      createPlugins: (schema) => exampleSetup({ schema }),
      nodeSpec: {
        marks: "em strong link strike",
      },
    }),
    displayCreditInformation: createCheckBox(true),
    imageType: createDropDownField(
      [
        { text: "Photograph", value: "Photograph" },
        { text: "Illustration", value: "Illustration" },
        { text: "Composite", value: "Composite" },
      ],
      "Photograph"
    ),
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
    weighting: createDropDownField(
      [
        { text: "inline (default)", value: "none-selected" },
        { text: "supporting", value: "supporting" },
        { text: "showcase", value: "showcase" },
        { text: "thumbnail", value: "thumbnail" },
        { text: "immersive", value: "immersive" },
      ],
      "none-selected"
    ),
  };
};

export const createImageElement = (
  openImageSelector: (setMedia: SetMedia, mediaId?: string) => void
) =>
  createReactElementSpec(
    createImageFields(openImageSelector),
    (fields, errors, __, fieldViewSpecs) => {
      return (
        <ImageElementForm
          fieldValues={fields}
          errors={errors}
          fieldViewSpecs={fieldViewSpecs}
        />
      );
    },
    createValidator({
      caption: [htmlMaxLength(600)],
      altText: [htmlMaxLength(1000), htmlRequired()],
      source: [htmlMaxLength(250), htmlRequired()],
      photographer: [htmlMaxLength(250)],
    })
  );
