import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import { undefinedDropdownValue } from "../helpers/transform";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { createVideoFields } from "./VideoSpec";

export type ExternalVideoFields = {
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

export type ExternalVideoData = {
  fields: ExternalVideoFields;
};

export type PartialVideoData = {
  fields: Partial<ExternalVideoFields>;
};

export const transformElementIn: TransformIn<
  PartialVideoData,
  ReturnType<typeof createVideoFields>
> = ({ fields: { isMandatory, role, ...rest } }) => {
  return {
    isMandatory: isMandatory === "true",
    role: role ?? undefinedDropdownValue,
    ...rest,
  };
};

export const transformElementOut: TransformOut<
  ExternalVideoData,
  ReturnType<typeof createVideoFields>
> = ({
  isMandatory,
  role,
  ...rest
}: FieldNameToValueMap<
  ReturnType<typeof createVideoFields>
>): ExternalVideoData => {
  return {
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
