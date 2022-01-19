import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
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
> = ({ fields: isMandatory, ...rest }) => {
  return {
    isMandatory: isMandatory === "true",
    ...rest,
  };
};

export const transformElementOut: TransformOut<
  ExternalVideoData,
  ReturnType<typeof createVideoFields>
> = ({
  isMandatory,
  ...rest
}: FieldNameToValueMap<
  ReturnType<typeof createVideoFields>
>): ExternalVideoData => {
  return {
    fields: {
      isMandatory: isMandatory.toString(),
      ...rest,
    },
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
