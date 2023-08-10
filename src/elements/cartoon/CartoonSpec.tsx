import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import { htmlMaxLength, htmlRequired } from "../../plugin/helpers/validation";
import { useTyperighterAttrs } from "../helpers/typerighter";
import type { CartoonImageSelector, Image } from "../helpers/types/Media";
import { minAssetValidation } from "../image/ImageElement";

export const cartoonFields = (
  cartoonImageSelector: CartoonImageSelector,
  createCaptionPlugins: (schema: Schema) => Plugin[]
) => {
  return {
    largeImages: createCustomField<
      Image[],
      { cartoonImageSelector: CartoonImageSelector }
    >([], { cartoonImageSelector }, [minAssetValidation]),
    smallImages: createCustomField<
      Image[],
      { cartoonImageSelector: CartoonImageSelector }
    >([], { cartoonImageSelector }, [minAssetValidation]),
    caption: createFlatRichTextField({
      createPlugins: createCaptionPlugins,
      marks: "em strong link strike",
      validators: [htmlMaxLength(1000, undefined, "WARN")],
      placeholder: "Enter a caption for this cartoon…",
      attrs: useTyperighterAttrs,
    }),
    alt: createTextField({
      rows: 2,
      validators: [htmlMaxLength(1000), htmlRequired()],
      placeholder: "Describe the cartoon for visually impaired readers",
      isResizeable: true,
      attrs: useTyperighterAttrs,
    }),
    photographer: createTextField({
      validators: [htmlMaxLength(100)],
      placeholder: "Enter the artist...",
    }),
    source: createTextField({
      validators: [htmlMaxLength(100)],
      placeholder: "Enter the source...",
    }),
    displayCredit: createCustomField(true, true),
    role: createCustomDropdownField(undefinedDropdownValue, [
      { text: "inline (default)", value: undefinedDropdownValue },
      { text: "supporting", value: "supporting" },
      { text: "showcase", value: "showcase" },
      { text: "thumbnail", value: "thumbnail" },
      { text: "immersive", value: "immersive" },
    ]),
    imageType: createCustomDropdownField("Illustration", [
      { text: "Photograph", value: "Photograph" },
      { text: "Illustration", value: "Illustration" },
      { text: "Composite", value: "Composite" },
    ]),
  };
};
