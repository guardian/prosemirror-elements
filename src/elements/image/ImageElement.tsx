import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import { htmlMaxLength, htmlRequired } from "../../plugin/helpers/validation";
import { useTyperighterAttrs } from "../helpers/typerighter";
import type {
  ImageElementOptions,
  ImageSelector,
  MainImageData,
} from "../helpers/types/Media";
import { largestAssetMinDimension } from "./imageElementValidation";

export const minAssetValidation = largestAssetMinDimension(460);

export const createImageFields = ({
  createCaptionPlugins,
  openImageSelector,
  additionalRoleOptions: roleOptions,
}: ImageElementOptions) => {
  return {
    alt: createTextField({
      rows: 2,
      validators: [htmlMaxLength(1000), htmlRequired()],
      placeholder: "Describe the image for visually impaired readers",
      isResizeable: true,
      attrs: useTyperighterAttrs,
    }),
    caption: createFlatRichTextField({
      createPlugins: createCaptionPlugins,
      marks: "em strong link strike",
      validators: [htmlMaxLength(600, undefined, "WARN")],
      placeholder: "Enter a caption for this media…",
      attrs: useTyperighterAttrs,
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
    mainImage: createCustomField<
      MainImageData,
      { openImageSelector: ImageSelector }
    >(
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
    role: createCustomDropdownField(undefinedDropdownValue, roleOptions),
    copyright: createTextField(),
    picdarUrn: createTextField(),
  };
};
