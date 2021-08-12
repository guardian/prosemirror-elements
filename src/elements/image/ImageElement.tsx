import React from "react";
import { createCheckBox } from "../../plugin/fieldViews/CheckboxFieldView";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createDropDownField } from "../../plugin/fieldViews/DropdownFieldView";
import { createDefaultRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
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
    caption: createDefaultRichTextField(),
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
      return <ImageElementForm fieldViewSpecMap={fieldViewSpecs} />;
    },
    () => null
  );
