import { exampleSetup } from "prosemirror-example-setup";
import React from "react";
import { createCheckBox } from "../../plugin/fieldViews/CheckboxFieldView";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createDropDownField } from "../../plugin/fieldViews/DropdownFieldView";
import { createRepeaterField } from "../../plugin/fieldViews/RepeaterFieldView";
import {
  createDefaultRichTextField,
  createFlatRichTextField,
} from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { placeholderTestAttribute } from "../../plugin/helpers/placeholder";
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

const getCustomPlaceholder = (text: string) => () => {
  const span = document.createElement("span");
  span.style.fontFamily = "Comic Sans MS";
  span.style.display = "inline-block";
  span.style.height = "0px";
  span.style.width = "0px";
  span.style.whiteSpace = "nowrap";
  span.style.color = "#888";
  span.style.pointerEvents = "none";
  span.style.cursor = "text";
  span.draggable = false;
  span.innerHTML = text;
  span.setAttribute("data-cy", placeholderTestAttribute);
  return span;
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
    caption: createDefaultRichTextField([htmlRequired()], "Enter caption"),
    restrictedTextField: createFlatRichTextField({
      placeholder: "Enter restricted text",
      createPlugins: (schema) => exampleSetup({ schema }),
      marks: "em",
    }),
    altText: createTextField({
      placeholder: "Alt text",
      rows: 2,
      validators: [htmlMaxLength(100), htmlRequired()],
    }),
    src: createTextField({ placeholder: getCustomPlaceholder("Add src") }),
    code: createTextField({
      rows: 4,
      isCode: true,
      placeholder: "Write code here",
      maxRows: 10,
    }),
    resizeable: createTextField({ rows: 2, isResizeable: true }),
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
    ({ fields, errors, fieldValues }) => {
      return (
        <ImageElementForm
          fields={fields}
          errors={errors}
          fieldValues={fieldValues}
        />
      );
    }
  );
