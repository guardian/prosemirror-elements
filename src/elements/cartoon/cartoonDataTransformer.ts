import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { Asset } from "../helpers/defaultTransform";
import type { Image } from "../helpers/types/Media";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { cartoonFields } from "./CartoonSpec";

type ViewportSize = "small" | "medium" | "large"; // This used to be called "breakpoint"

type Variant = {
  viewportSize: ViewportSize;
  images: Image[];
};

type Fields = {
  variants: Variant[];
  role?: string;
  photographer?: string;
  caption?: string;
  alt?: string;
  source?: string;
  displayCredit?: boolean;
};

export type Element = {
  elementType: string;
  fields: Fields;
  assets: Asset[];
};

export const transformElementIn: TransformIn<
  Element,
  ReturnType<typeof cartoonFields>
> = ({ fields }) => {
  const { role, variants, ...rest } = fields;

  const getImages = (viewportSize: ViewportSize): Image[] => {
    const variant = variants.find(
      (variant) => variant.viewportSize === viewportSize
    );

    if (!variant) return [];

    return variant.images;
  };

  return {
    role: role ?? undefinedDropdownValue,
    largeImages: getImages("large"),
    smallImages: getImages("small"),
    ...rest,
  };
};

export const transformElementOut: TransformOut<
  Element,
  ReturnType<typeof cartoonFields>
> = ({
  largeImages,
  smallImages,
  role,
  ...rest
}: FieldNameToValueMap<ReturnType<typeof cartoonFields>>): Element => {
  return {
    elementType: "cartoon",
    fields: {
      variants: [
        {
          viewportSize: "small",
          images: smallImages,
        },
        {
          viewportSize: "large",
          images: largeImages,
        },
      ],
      role: role === undefinedDropdownValue ? undefined : role,
      ...rest,
    },
    assets: [],
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
