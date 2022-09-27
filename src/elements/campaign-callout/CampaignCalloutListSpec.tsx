import React from "react";
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CampaignCalloutList } from "./CampaignCalloutList";
import { undefinedDropdownValue } from "../helpers/transform";

type Fields = {
  callout: string;
  formId: number;
  tagName: string;
  description: string;
  formUrl: string;
  _type: string;
};

type Rules = {
  requiredTags: string[];
  lackingTags: string[];
  matchAllTags: boolean;
};
type Campaign = {
  id: string;
  fields: Fields[];
  rules: Rules[];
  priority: number;
  displayOnSensitive: boolean;
  activeFrom: number;
  activeUntil: number;
  name: string;
};
type Props = {
  campaignList: Campaign[];
};

const getCampaignList = ({ campaignList }: Props) => {
  const campaigns = campaignList.map((campaign) => {
    return { text: campaign.id, value: campaign.id };
  });

  return [
    { text: "Please select a campaign...", value: undefinedDropdownValue },
    ...campaigns,
  ];
};

export const createCampaignCalloutListFields = (props: Props) => {
  return {
    campaignList: createCustomDropdownField(
      undefinedDropdownValue,
      getCampaignList(props)
    ),
  };
};

export const createCampaignCalloutListElement = (props: Props) =>
  createReactElementSpec(
    createCampaignCalloutListFields(props),
    ({ fields }) => {
      return <CampaignCalloutList fields={fields} />;
    }
  );
