import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import { undefinedDropdownValue } from "../helpers/transform";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { createTweetFields } from "./TweetSpec";

export type ExternalTweetFields = {
  source: string;
  isMandatory: string;
  role: string | undefined;
  url: string;
  originalUrl: string;
  id: string;
  caption: string;
  html: string;
  authorName: string;
};

export type ExternalData = {
  fields: ExternalTweetFields;
};

export type PartialData = {
  fields: Partial<ExternalTweetFields>;
};

export const transformElementIn: TransformIn<
  PartialData,
  ReturnType<typeof createTweetFields>
> = ({ fields: { isMandatory, role, ...rest } }) => {
  return {
    isMandatory: isMandatory === "true",
    role: role ?? undefinedDropdownValue,
    ...rest,
  };
};

export const transformElementOut: TransformOut<
  ExternalData,
  ReturnType<typeof createTweetFields>
> = ({
  isMandatory,
  role,
  ...rest
}: FieldNameToValueMap<ReturnType<typeof createTweetFields>>): ExternalData => {
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
