import type { Breakpoint } from "@guardian/src-foundations";
import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { Asset } from "../helpers/defaultTransform";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { MainImageData } from "../image/ImageElement";
import type { cartoonFields } from "./CartoonSpec";

export type Element = {
  elementType: string;
  fields: Record<string, string | undefined>;
  assets: Asset[];
  elements?: Element[];
};

export const transformElementIn: TransformIn<
  Element,
  ReturnType<typeof cartoonFields>
> = ({ fields, elements }) => {
  const { role, photographer, caption, source } = fields;

  const getImages = (breakpoint: Breakpoint): MainImageData[] => {
    if (Array.isArray(elements)) {
      return elements
        .filter(
          (element) =>
            element.elementType === "image" &&
            element.fields.breakpoint === breakpoint
        )
        .map((element) => {
          return {
            mediaId: element.fields.mediaId,
            mediaApiUri: element.fields.mediaApiUri,
            assets: element.assets,
            caption: element.fields.caption,
          };
        });
    } else {
      return [];
    }
  };

  return {
    role: role ?? undefinedDropdownValue,
    credit: photographer,
    source,
    alt: caption,
    desktopImages: getImages("desktop"),
    mobileImages: getImages("mobile"),
  };
};

export const transformElementOut: TransformOut<
  Element,
  ReturnType<typeof cartoonFields>
> = ({
  role,
  mobileImages,
  desktopImages,
  ...rest
}: FieldNameToValueMap<ReturnType<typeof cartoonFields>>): Element => {
  const getElementFromImage = (
    image: MainImageData,
    breakpoint: Breakpoint
  ) => {
    const { assets, ...rest } = image;
    return {
      elementType: "image",
      fields: {
        breakpoint,
        ...rest,
      },
      assets,
    };
  };

  const elements = mobileImages
    .map((image) => getElementFromImage(image, "mobile"))
    .concat(
      desktopImages.map((image) => getElementFromImage(image, "desktop"))
    );

  return {
    elementType: "cartoon",
    fields: {
      role: role === undefinedDropdownValue ? undefined : role,
      ...rest,
    },
    elements,
    assets: [],
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
