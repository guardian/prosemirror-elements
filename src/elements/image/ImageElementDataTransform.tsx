import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { Asset, createImageFields, MainImageData } from "./ImageElement";

type ExternalImageData = {
  assets: Asset[];
  fields: {
    alt?: string;
    caption: string;
    displayCredit: string;
    imageType: string;
    isMandatory: string;
    mediaApiUri: string;
    mediaId: string;
    photographer?: string;
    role: string;
    source?: string;
    suppliersReference: string;
  };
};

export const imageElementTransforms = () => {
  return {
    transformElementDataIn: ({
      assets = [],
      fields,
    }: ExternalImageData): FieldNameToValueMap<
      ReturnType<typeof createImageFields>
    > => {
      const {
        alt,
        caption,
        displayCredit,
        imageType,
        mediaApiUri,
        mediaId,
        photographer,
        role,
        source,
        suppliersReference,
      } = fields;

      const mainImage: MainImageData = {
        assets,
        suppliersReference,
        mediaId,
        mediaApiUri,
      };

      return {
        alt: alt ?? "",
        caption,
        displayCredit: displayCredit === "true",
        imageType,
        photographer: photographer ?? "",
        role,
        source: source ?? "",
        mainImage,
      };
    },
    transformElementDataOut: ({
      alt,
      caption,
      displayCredit,
      imageType,
      photographer,
      role,
      source,
      mainImage,
    }: FieldNameToValueMap<
      ReturnType<typeof createImageFields>
    >): ExternalImageData => {
      return {
        assets: mainImage.assets,
        fields: {
          alt,
          caption,
          displayCredit: displayCredit.toString(),
          imageType,
          isMandatory: "true",
          mediaApiUri: mainImage.mediaApiUri,
          mediaId: mainImage.mediaId,
          photographer,
          role,
          source,
          suppliersReference: "",
        },
      };
    },
  };
};
