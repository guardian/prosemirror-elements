import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import { undefinedDropdownValue } from "../helpers/transform";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { calloutFields } from "./Callout";

export type ExternalCalloutFields = {
  campaignId: string | undefined;
  isNonCollapsible: string;
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
  const { campaignId, isNonCollapsible } = fields;

  return {
    isNonCollapsible: isNonCollapsible === "true",
    campaignId: campaignId ?? undefinedDropdownValue,
  };
};

export const transformElementOut: TransformOut<
  ExternalCalloutData,
  typeof calloutFields
> = ({
  isNonCollapsible,
  campaignId,
}: FieldNameToValueMap<typeof calloutFields>): ExternalCalloutData => {
  return {
    assets: [],
    fields: {
      isNonCollapsible: isNonCollapsible.toString(),
      campaignId:
        campaignId === undefinedDropdownValue ? undefined : campaignId,
    },
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
