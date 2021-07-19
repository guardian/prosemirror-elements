import React from "react";
import { createCheckBox } from "../../plugin/fieldViews/CheckboxFieldView";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createDropDownField } from "../../plugin/fieldViews/DropdownFieldView";
import { createDefaultRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { ImageElementForm } from "./ImageElementForm";

export type SetMedia = (
  mediaId: string,
  mediaApiUri: string,
  assets: string[]
) => void;

export type MainImageData = {
  mediaId?: string | undefined;
  mediaApiUri?: string | undefined;
  assets: string[];
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
    displayText: createCheckBox(true),
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
      },
      { openImageSelector }
    ),
    source: createTextField(),
    weighting: createDropDownField(
      [
        { text: "inline (default)", value: undefined },
        { text: "supporting", value: "supporting" },
        { text: "showcase", value: "showcase" },
        { text: "thumbnail", value: "thumbnail" },
        { text: "immersive", value: "immersive" },
      ],
      undefined
    ),
  };
};

export const createImageElement = <Name extends string>(
  name: Name,
  openImageSelector: (setMedia: SetMedia, mediaId?: string) => void
) =>
  createReactElementSpec(
    name,
    createImageFields(openImageSelector),
    (fields, errors, __, fieldViewSpecs) => {
      return <ImageElementForm fieldViewSpecMap={fieldViewSpecs} />;
    },
    () => null,
    {
      caption: "",
      displayText: { value: true },
      altText: "",
      source: "",
      weighting: "supporting",
      imageType: "Photograph",
      photographer: "",
      mainImage: {
        mediaId: undefined,
        mediaApiUri: undefined,
        assets: [],
      },
    }
  );
