import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { calloutFields } from "./Callout";

export type ExternalCalloutFields = {
  campaignId: string | undefined;
  isNonCollapsible: string;
  tagId: string | undefined;
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
  const { campaignId, isNonCollapsible, tagId } = fields;

  return {
    isNonCollapsible: isNonCollapsible === "true",
    campaignId: campaignId ?? undefinedDropdownValue,
    tagId,
  };
};

export const transformElementOut: TransformOut<
  ExternalCalloutData,
  typeof calloutFields
> = ({
  isNonCollapsible,
  campaignId,
  tagId,
}: FieldNameToValueMap<typeof calloutFields>): ExternalCalloutData => {
  return {
    assets: [],
    fields: {
      isNonCollapsible: isNonCollapsible.toString(),
      campaignId:
        campaignId === undefinedDropdownValue ? undefined : campaignId,
      tagId,
    },
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
