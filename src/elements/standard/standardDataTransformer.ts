import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { Asset } from "../helpers/defaultTransform";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { createStandardFields } from "./StandardSpec";

export type ExternalFields = {
  source: string;
  isMandatory: string;
  url: string;
  description: string;
  originalUrl: string;
  height: string;
  width: string;
  title: string;
  html: string;
  authorName: string;
  role: string | undefined;
};

export type ExternalData = {
  assets: Asset[];
  fields: ExternalFields;
};

export type PartialData = {
  assets: Asset[];
  fields: Partial<ExternalFields>;
};

export const transformElementIn: TransformIn<
  PartialData,
  ReturnType<typeof createStandardFields>
> = ({ assets, fields: { isMandatory, role, ...rest } }) => {
  return {
    isMandatory: isMandatory === "true",
    role: role ?? undefinedDropdownValue,
    assets,
    ...rest,
  };
};

export const transformElementOut: TransformOut<
  ExternalData,
  ReturnType<typeof createStandardFields>
> = ({
  isMandatory,
  role,
  assets,
  ...rest
}: FieldNameToValueMap<
  ReturnType<typeof createStandardFields>
>): ExternalData => {
  return {
    assets,
    fields: {
      isMandatory: isMandatory.toString(),
      role: role === undefinedDropdownValue ? undefined : role,
      ...rest,
    },
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
