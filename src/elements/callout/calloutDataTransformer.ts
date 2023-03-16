import pickBy from "lodash/pickBy";
import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { calloutFields } from "./Callout";

export type ExternalCalloutFields = {
  campaignId: string | undefined;
  isNonCollapsible: string;
  tagId: string | undefined;
  prompt?: string;
  callout?: string;
  description?: string;
};

export type ExternalCalloutData = {
  fields: ExternalCalloutFields;
  assets: [];
};

export type PartialEmbedData = {
  fields: Partial<ExternalCalloutFields>;
};

export const transformElementIn: TransformIn<
  PartialEmbedData,
  typeof calloutFields
> = ({ fields }) => {
  const {
    campaignId,
    isNonCollapsible,
    tagId,
    prompt,
    callout,
    description,
  } = fields;

  return {
    isNonCollapsible: isNonCollapsible === "true",
    campaignId: campaignId ?? undefinedDropdownValue,
    tagId,
    prompt,
    callout,
    description,
  };
};

export const transformElementOut: TransformOut<
  ExternalCalloutData,
  typeof calloutFields
> = ({
  isNonCollapsible,
  campaignId,
  tagId,
  prompt,
  callout,
  description,
}: FieldNameToValueMap<typeof calloutFields>): ExternalCalloutData => {
  const optionalFields = pickBy({
    prompt,
    callout,
    description,
  });

  return {
    assets: [],
    fields: {
      isNonCollapsible: isNonCollapsible.toString(),
      campaignId:
        campaignId === undefinedDropdownValue ? undefined : campaignId,
      tagId,
      ...optionalFields,
    },
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
