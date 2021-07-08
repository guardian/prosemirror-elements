import { exampleSetup } from "prosemirror-example-setup";
import type { Schema } from "prosemirror-model";
import React from "react";
import { createCheckBox } from "../../plugin/fieldViews/CheckboxFieldView";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createDropDownField } from "../../plugin/fieldViews/DropdownFieldView";
import { createRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { ImageElementForm } from "./ImageElementForm";

export type SetMedia = (
  mediaId: string,
  mediaApiUri: string,
  assets: string[]
) => void;

const createPlugins = (schema: Schema) => exampleSetup({ schema });

type ImageField = {
  mediaId?: string | undefined;
  mediaApiUri?: string | undefined;
  assets: string[];
};

type ImageProps = {
  onSelectImage: (setMedia: SetMedia) => void;
  onCropImage: (mediaId: string, setMedia: SetMedia) => void;
};

export const createImageFields = (
  onSelectImage: (setSrc: SetMedia) => void,
  onCropImage: (mediaId: string, setMedia: SetMedia) => void
) => {
  return {
    caption: createRichTextField(),
    altText: createRichTextField(),
    src: createTextField(),
    mainImage: createCustomField<ImageField, ImageProps>(
      { mediaId: undefined, mediaApiUri: undefined, assets: [] },
      {
        onSelectImage,
        onCropImage,
      }
    ),
    useSrc: createCheckBox(false),
    optionDropdown: createDropDownField(
      [
        { text: "Option 1", value: "opt1" },
        { text: "Option 2", value: "opt2" },
        { text: "Option 3", value: "opt3" },
      ],
      "opt1"
    ),
  };
};

export const createImageElement = <Name extends string>(
  name: Name,
  onSelect: (setSrc: SetMedia) => void,
  onCrop: (mediaId: string, setSrc: SetMedia) => void
) =>
  createReactElementSpec(
    name,
    createImageFields(onSelect, onCrop),
    (fields, errors, __, fieldViewSpecs) => {
      return (
        <ImageElementForm
          fields={fields}
          errors={errors}
          fieldViewSpecMap={fieldViewSpecs}
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
