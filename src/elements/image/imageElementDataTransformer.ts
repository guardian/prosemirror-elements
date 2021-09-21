import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { TransformIn, TransformOut } from "../transformer/types/Transform";
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

type PartialExternalImageData = {
  assets: Asset[];
  fields: Partial<ImageFields>;
};

export const transformElementIn: TransformIn<
  PartialExternalImageData,
  ReturnType<typeof createImageFields>
> = ({ assets, fields }) => {
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

  const mainImage: MainImageData | undefined = {
    assets,
    suppliersReference: suppliersReference ?? "",
    mediaId,
    mediaApiUri,
  };

  return {
    alt,
    caption,
    displayCredit: displayCredit === "true",
    imageType,
    photographer,
    role,
    source,
    mainImage,
  };
};

export const transformElementOut: TransformOut<
  ExternalImageData,
  ReturnType<typeof createImageFields>
> = ({
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
      mediaApiUri: mainImage.mediaApiUri ?? "",
      mediaId: mainImage.mediaId ?? "",
      photographer,
      role,
      source,
      suppliersReference: mainImage.suppliersReference,
    },
  };
};

export const transformElement = [transformElementIn, transformElementOut];
