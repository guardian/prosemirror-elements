import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { Asset } from "../helpers/defaultTransform";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { cartoonFields } from "./CartoonSpec";

type ViewportSize = "small" | "medium" | "large"; // This used to be called "breakpoint"

export type Image = {
  mimeType: string; // e.g. ("image/jpeg", "image/png" or "image/svg+xml")
  file: string;
  width: number | string;
  height: number | string;
  mediaId?: string;
  mediaApiUri?: string;
};

type Variant = {
  viewportSize: ViewportSize;
  images: Image[];
};

type Fields = {
  variants: Variant[];
  role?: string;
  credit?: string;
  caption?: string;
  source?: string;
  displayCredit?: string;
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
  const { role, credit, caption, source, variants } = fields;

  const getImages = (viewportSize: ViewportSize): Image[] => {
    const variant = variants.find(
      (variant) => variant.viewportSize === viewportSize
    );

    if (!variant) return [];

    return variant.images;
  };

  return {
    role: role ?? undefinedDropdownValue,
    credit,
    source,
    caption,
    largeImages: getImages("large"),
    smallImages: getImages("small"),
  };
};

export const transformElementOut: TransformOut<
  Element,
  ReturnType<typeof cartoonFields>
> = ({
  largeImages,
  smallImages,
  displayCredit,
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
      displayCredit: displayCredit.toString(),
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
