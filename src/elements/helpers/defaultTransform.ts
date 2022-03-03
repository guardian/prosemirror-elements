import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { FieldDescriptions } from "../../plugin/types/Element";
import type { TransformIn, TransformOut } from "./types/Transform";

export type Asset = {
  assetType: string;
  mimeType: string;
  url: string;
  fields: {
    width: number | string;
    height: number | string;
    isMaster: boolean | undefined;
  };
};

type FlexibleModelElement<FDesc extends FieldDescriptions<string>> = {
  fields: Partial<Omit<FieldNameToValueMap<FDesc>, "assets">> & {
    isMandatory?: string;
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
    fields: { ...fields, isMandatory: isMandatory ? "true" : "false" },
  };
};

export const transformElement = <FDesc extends FieldDescriptions<string>>(
  isMandatory?: boolean
) => {
  return {
    in: transformElementDataIn<FDesc>(),
    out: transformElementDataOut<FDesc>(isMandatory),
  };
};
