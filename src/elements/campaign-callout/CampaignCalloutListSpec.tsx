import React from "react";
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CampaignCalloutList } from "./CampaignCalloutList";
import { undefinedDropdownValue } from "../helpers/transform";

type Props = {
  campaignList: Array<{
    id: string;
  }>;
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
