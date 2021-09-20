import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { TransformIn, TransformOut } from "../transformer/Transformer";
import type { Asset, createImageFields, MainImageData } from "./ImageElement";

type ImageFields = {
  alt: string;
  caption: string;
  displayCredit: string;
  imageType: string;
  isMandatory: string;
  mediaApiUri: string;
  mediaId: string;
  photographer: string;
  role: string;
  source: string;
  suppliersReference: string;
};

type ExternalImageData = {
  assets: Asset[];
  fields: ImageFields;
};

type PartialExternalImageData = Partial<{
  assets: Asset[];
  fields: Partial<ImageFields>;
}>;

export const transformElementDataIn: TransformIn<
  PartialExternalImageData,
  ReturnType<typeof createImageFields>
> = ({ assets, fields }: PartialExternalImageData) => {
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
  } = fields ?? {};

  const mainImage: MainImageData | undefined =
    assets && suppliersReference && mediaId && mediaApiUri
      ? {
          assets,
          suppliersReference,
          mediaId,
          mediaApiUri,
        }
      : undefined;

  return {
    altText: alt,
    caption,
    displayCreditInformation: displayCredit === "true",
    imageType,
    photographer,
    weighting: role,
    source,
    mainImage,
  };
};

export const transformElementDataOut: TransformOut<
  ExternalImageData,
  ReturnType<typeof createImageFields>
> = ({
  altText,
  caption,
  displayCreditInformation,
  imageType,
  photographer,
  weighting,
  source,
  mainImage,
}: FieldNameToValueMap<
  ReturnType<typeof createImageFields>
>): ExternalImageData => {
  return {
    assets: mainImage.assets,
    fields: {
      alt: altText,
      caption,
      displayCredit: displayCreditInformation.toString(),
      imageType,
      isMandatory: "true",
      mediaApiUri: mainImage.mediaApiUri ?? "",
      mediaId: mainImage.mediaId ?? "",
      photographer,
      role: weighting,
      source,
      suppliersReference: mainImage.suppliersReference,
    },
  };
};
