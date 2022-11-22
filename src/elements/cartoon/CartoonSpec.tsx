import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import { htmlMaxLength, htmlRequired } from "../../plugin/helpers/validation";
import { useTyperighterAttrs } from "../helpers/typerighter";
import type { ImageSelector, MainImageData } from "../image/ImageElement";
import { minAssetValidation } from "../image/ImageElement";

export const cartoonFields = (onCropImage: ImageSelector) => {
  return {
    role: createCustomDropdownField(undefinedDropdownValue, [
      { text: "inline (default)", value: undefinedDropdownValue },
      { text: "supporting", value: "supporting" },
      { text: "showcase", value: "showcase" },
      { text: "thumbnail", value: "thumbnail" },
      { text: "immersive", value: "immersive" },
    ]),
    credit: createTextField({
      validators: [htmlMaxLength(100)],
      placeholder: "Comic by",
    }),
    verticalPadding: createTextField({
      validators: [htmlMaxLength(10)],
      placeholder: "20",
    }),
    backgroundColour: createTextField({
      validators: [htmlMaxLength(6)],
      placeholder: "FFFFFF",
    }),
    alt: createTextField({
      rows: 2,
      validators: [htmlMaxLength(1000), htmlRequired()],
      placeholder: "Describe the image for visually impaired readers",
      isResizeable: true,
      attrs: useTyperighterAttrs,
    }),
    desktopImages: createCustomField<
      MainImageData[],
      { openImageSelector: ImageSelector }
    >([], { openImageSelector: onCropImage }, [minAssetValidation]),
    mobileImages: createCustomField<
      MainImageData[],
      { openImageSelector: ImageSelector }
    >([], { openImageSelector: onCropImage }, [minAssetValidation]),
  };
};
