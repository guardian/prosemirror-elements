import pickBy from "lodash/pickBy";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { Asset } from "../helpers/defaultTransform";
import { undefinedDropdownValue } from "../helpers/transform";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { createImageFields, MainImageData } from "./ImageElement";

export type ImageFields = {
  alt?: string;
  caption?: string;
  displayCredit: string;
  imageType: string;
  isMandatory: string;
  mediaApiUri?: string;
  mediaId: string;
  photographer?: string;
  role: string | undefined;
  source?: string;
  suppliersReference?: string;
  copyright?: string;
  picdarUrn?: string;
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
    suppliersReference,
    displayCredit,
    mediaId,
    mediaApiUri,
    role,
    ...rest
  } = fields;

  const mainImage: MainImageData | undefined = {
    assets,
    suppliersReference: suppliersReference ?? "",
    mediaId,
    mediaApiUri,
  };

  return {
    displayCredit: displayCredit === "true",
    role: role ?? undefinedDropdownValue,
    mainImage,
    ...rest,
  };
};

export const transformElementOut: TransformOut<
  ExternalImageData,
  ReturnType<typeof createImageFields>
> = ({
  displayCredit,
  role,
  mainImage,
  photographer,
  source,
  alt,
  caption,
  copyright,
  picdarUrn,
  ...rest
}: FieldNameToValueMap<
  ReturnType<typeof createImageFields>
>): ExternalImageData => {
  const optionalFields = pickBy(
    {
      photographer,
      source,
      alt,
      caption,
      copyright,
      picdarUrn,
      suppliersReference: mainImage.suppliersReference,
      mediaApiUri: mainImage.mediaApiUri ?? "",
    },
    (field) => field && field.length > 0
  );

  return {
    assets: mainImage.assets,
    fields: {
      displayCredit: displayCredit.toString(),
      isMandatory: "true",
      mediaId: mainImage.mediaId ?? "",
      role: role === undefinedDropdownValue ? undefined : role,
      ...optionalFields,
      ...rest,
    },
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
