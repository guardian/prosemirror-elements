import { undefinedDropdownValue } from "../../plugin/helpers/constants";
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

export const transformElementDataIn = <FDesc extends FieldDescriptions<string>>(
  transformRole: boolean
): TransformIn<FlexibleModelElement<FDesc>, FDesc> => ({ fields, assets }) => {
  const transformedFields = { ...fields } as FieldNameToValueMap<FDesc>;

  if (transformRole) {
    type FieldWithRole = FieldNameToValueMap<FDesc> & {
      role: string;
    };
    (transformedFields as FieldWithRole).role =
      (transformedFields.role as string | undefined) ?? undefinedDropdownValue;
  }

  if (transformedFields.isMandatory) {
    type FieldWithIsMandatory = FieldNameToValueMap<FDesc> & {
      isMandatory: boolean;
    };
    (transformedFields as FieldWithIsMandatory).isMandatory =
      fields.isMandatory === "true";
  }

  if (assets?.length) {
    return { ...transformedFields, assets };
  }

  return transformedFields;
};

export const transformElementDataOut = <
  FDesc extends FieldDescriptions<string>
>(
  isMandatory: boolean | undefined,
  transformRole: boolean
): TransformOut<FlexibleModelElement<FDesc>, FDesc> => ({
  assets,
  ...fields
}: FieldNameToValueMap<FDesc>) => {
  const baseFields = {
    assets: assets || [],
    fields: { ...fields },
  } as FlexibleModelElement<FDesc>;

  let transformedFields = fields;

  if (isMandatory !== undefined) {
    transformedFields = {
      ...transformedFields,
      isMandatory: fields.isMandatory ? "true" : "false",
    };
  }

  if (transformRole) {
    transformedFields = {
      ...transformedFields,
      role: fields.role === undefinedDropdownValue ? undefined : fields.role,
    };
  }

  return {
    ...baseFields,
    fields: transformedFields,
  };
};

interface TransformOptions {
  isMandatory?: boolean;
  transformRole?: boolean;
}

export const transformElement = <FDesc extends FieldDescriptions<string>>({
  isMandatory,
  transformRole,
}: TransformOptions = {}) => {
  return {
    in: transformElementDataIn<FDesc>(transformRole ?? false),
    out: transformElementDataOut<FDesc>(isMandatory, transformRole ?? false),
  };
};
