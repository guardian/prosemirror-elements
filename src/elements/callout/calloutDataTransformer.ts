import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { calloutFields } from "./Callout";

export type ExternalCalloutFields = {
  campaignId: string | undefined;
  isNonCollapsible: string;
  tagId: string | undefined;
  overridePrompt?: string;
  overrideTitle?: string;
  overrideDescription?: string;
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
    overridePrompt,
    overrideTitle,
    overrideDescription,
  } = fields;

  // If there is no override set, we want to use the default.
  // But if the override is an empty string, we want to use it to show nothing.
  const getUseOverride = (val?: string): boolean =>
    val === undefined ? true : false;

  return {
    isNonCollapsible: isNonCollapsible === "true",
    campaignId: campaignId ?? undefinedDropdownValue,
    tagId,
    useDefaultPrompt: getUseOverride(overridePrompt),
    overridePrompt,
    useDefaultTitle: getUseOverride(overrideTitle),
    overrideTitle,
    useDefaultDescription: getUseOverride(overrideDescription),
    overrideDescription,
  };
};

export const transformElementOut: TransformOut<
  ExternalCalloutData,
  typeof calloutFields
> = ({
  isNonCollapsible,
  campaignId,
  tagId,
  useDefaultPrompt,
  overridePrompt,
  useDefaultTitle,
  overrideTitle,
  useDefaultDescription,
  overrideDescription,
}: FieldNameToValueMap<typeof calloutFields>): ExternalCalloutData => {
  const cleanupDescription = (desc: string): string => {
    // Empty richtext fields have a paragraph tag, so we should check if its empty
    const noTags = desc.replace(/(<([^>]+)>)/gi, "");
    return noTags.trim() ? desc : "";
  };

  return {
    assets: [],
    fields: {
      isNonCollapsible: isNonCollapsible.toString(),
      campaignId:
        campaignId === undefinedDropdownValue ? undefined : campaignId,
      tagId,
      ...(!useDefaultPrompt && { overridePrompt: overridePrompt.trim() }),
      ...(!useDefaultTitle && { overrideTitle: overrideTitle.trim() }),
      ...(!useDefaultDescription && {
        overrideDescription: cleanupDescription(overrideDescription),
      }),
    },
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
