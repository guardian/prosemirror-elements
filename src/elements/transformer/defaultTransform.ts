import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { FieldDescriptions } from "../../plugin/types/Element";
import type { TransformIn, TransformOut } from "./types/Transform";

type FlexibleModelElement<FDesc extends FieldDescriptions<string>> = {
  fields: Partial<Omit<FieldNameToValueMap<FDesc>, "assets">> & {
    isMandatory?: boolean;
  };
  assets?: string[];
};

export const transformElementDataIn = <
  FDesc extends FieldDescriptions<string>
>(): TransformIn<FlexibleModelElement<FDesc>, FDesc> => ({ fields }) => {
  return ({ ...fields } as unknown) as FieldNameToValueMap<FDesc>;
};

export const transformElementDataOut = <
  FDesc extends FieldDescriptions<string>
>(
  isMandatory?: boolean
): TransformOut<FlexibleModelElement<FDesc>, FDesc> => ({
  assets,
  ...fields
}: FieldNameToValueMap<FDesc>) => {
  const baseFields = {
    assets: assets || [],
    fields: { ...fields },
  } as FlexibleModelElement<FDesc>;

  if (isMandatory === undefined) {
    return baseFields;
  }

  return {
    ...baseFields,
    fields: { ...fields, isMandatory },
  };
};

export const transformElement = <FDesc extends FieldDescriptions<string>>() => {
  return {
    in: transformElementDataIn<FDesc>(),
    out: transformElementDataOut<FDesc>(),
  };
};
