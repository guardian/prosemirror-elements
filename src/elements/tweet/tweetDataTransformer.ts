import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { Asset } from "../helpers/defaultTransform";
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
  hideMedia?: string;
  hideThread?: string;
};

export type ExternalData = {
  assets: Asset[];
  fields: ExternalTweetFields;
};

export type PartialData = {
  assets: Asset[];
  fields: Partial<ExternalTweetFields>;
};

export const transformElementIn: TransformIn<
  PartialData,
  ReturnType<typeof createTweetFields>
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
  ReturnType<typeof createTweetFields>
> = ({
  isMandatory,
  role,
  assets,
  ...rest
}: FieldNameToValueMap<ReturnType<typeof createTweetFields>>): ExternalData => {
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
