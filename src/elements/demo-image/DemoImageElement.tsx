import { exampleSetup } from "prosemirror-example-setup";
import React from "react";
import { createCheckBox } from "../../plugin/fieldViews/CheckboxFieldView";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createDropDownField } from "../../plugin/fieldViews/DropdownFieldView";
import {
  createDefaultRichTextField,
  createFlatRichTextField,
} from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { htmlMaxLength, htmlRequired } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { ImageElementForm } from "./DemoImageElementForm";

export type DemoSetMedia = (
  mediaId: string,
  mediaApiUri: string,
  assets: string[],
  caption: string
) => void;

type ImageField = {
  mediaId?: string | undefined;
  mediaApiUri?: string | undefined;
  assets: string[];
};

type ImageProps = {
  onSelectImage: (setMedia: DemoSetMedia) => void;
  onCropImage: (mediaId: string, setMedia: DemoSetMedia) => void;
};

export const createImageFields = (
  onSelectImage: (setSrc: DemoSetMedia) => void,
  onCropImage: (mediaId: string, setMedia: DemoSetMedia) => void
) => {
  return {
    caption: createDefaultRichTextField([htmlRequired()]),
    restrictedTextField: createFlatRichTextField({
      createPlugins: (schema) => exampleSetup({ schema }),
      nodeSpec: {
        marks: "em",
      },
    }),
    altText: createTextField({
      rows: 2,
      validators: [htmlMaxLength(100), htmlRequired()],
    }),
    src: createTextField(),
    code: createTextField({
      rows: 4,
      isCode: true,
    }),
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
    customDropdown: createCustomDropdownField("opt1", [
      { text: "Option 1", value: "opt1" },
      { text: "Option 2", value: "opt2" },
      { text: "Option 3", value: "opt3" },
    ]),
  };
};

export const createDemoImageElement = (
  onSelect: (setSrc: DemoSetMedia) => void,
  onCrop: (mediaId: string, setSrc: DemoSetMedia) => void
) =>
  createReactElementSpec(
    createImageFields(onSelect, onCrop),
    (fieldValues, errors, __, fields) => {
      return (
        <ImageElementForm
          fields={fields}
          errors={errors}
          fieldValues={fieldValues}
        />
      );
    }
  );
