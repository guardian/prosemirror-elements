import React from "react";
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CampaignCalloutList } from "./CampaignCalloutList";
import { undefinedDropdownValue } from "../helpers/transform";

type Props = {
  campaignList: Array<{
    id: string;
  }>;
};

const getCampaignList = ({ campaignList }: Props) => {
  const res = campaignList.map((campaign) => {
    return { text: campaign.id, value: campaign.id };
  });

  return [{ text: "something", value: "something" }, ...res];

  return res;
};

export const createCampaignCalloutListFields = (props: Props) => {
  const campaigns = getCampaignList(props);
  console.log(campaigns);
  return {
    campaignList: createCustomDropdownField("something", campaigns),
  };
};

export const createCampaignCalloutListElement = (props: Props) =>
  createReactElementSpec(
    createCampaignCalloutListFields(props),
    ({ fields }) => {
      return <CampaignCalloutList fields={fields} />;
    }
  );
