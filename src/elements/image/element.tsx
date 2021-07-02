import React from "react";
import type { CustomField } from "../../plugin/types/Element";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { ImageElement } from "./ImageElement";

export type SetMedia = (
  mediaId: string,
  mediaApiUri: string,
  assets: string[]
) => void;

export const imageProps = (
  onSelectImage: (setSrc: SetMedia) => void,
  onCropImage: (mediaId: string, setMedia: SetMedia) => void
) => {
  return {
    caption: {
      type: "richText",
    },
    altText: {
      type: "richText",
    },
    src: {
      type: "text",
    },
    mainImage: {
      type: "custom",
      defaultValue: { mediaId: undefined, mediaApiUri: undefined, assets: [] },
      props: {
        onSelectImage,
        onCropImage,
      },
    } as CustomField<
      { mediaId?: string; mediaApiUri?: string; assets: string[] },
      {
        onSelectImage: (setSrc: SetMedia) => void;
        onCropImage: (mediaId: string, setSrc: SetMedia) => void;
      }
    >,
    useSrc: {
      type: "checkbox",
      defaultValue: { value: false },
    },
    optionDropdown: {
      type: "dropdown",
      options: [
        { text: "Option 1", value: "opt1" },
        { text: "Option 2", value: "opt2" },
        { text: "Option 3", value: "opt3" },
      ],
      defaultValue: "opt1",
    },
  } as const;
};

export const createImageElement = <Name extends string>(
  name: Name,
  onSelect: (setSrc: SetMedia) => void,
  onCrop: (mediaId: string, setSrc: SetMedia) => void
) =>
  createReactElementSpec(
    name,
    imageProps(onSelect, onCrop),
    (fields, errors, __, fieldViewPropMap) => {
      return (
        <ImageElement
          fields={fields}
          errors={errors}
          fieldViewPropMap={fieldViewPropMap}
        />
      );
    },
    ({ altText }) => {
      const el = document.createElement("div");
      el.innerHTML = altText;
      return el.innerText ? null : { altText: ["Alt tag must be set"] };
    },
    {
      caption: "",
      useSrc: { value: true },
      altText: "",
      mainImage: { mediaId: undefined, mediaApiUri: undefined, assets: [] },
      src: "",
      optionDropdown: "opt1",
    }
  );
