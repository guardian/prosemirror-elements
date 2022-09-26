import React from "react";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CampaignCalloutList } from "./CampaignCalloutList";

type Props = {
  campaignList: Array<{
    id: String;
  }>;
};

export const createCampaignCalloutListFields = ({ campaignList }: Props) => {
  return {
    campaignList: createTextField({
      placeholder: "Enter the source URL for this embed…",
    }),
  };
};

export const createCampaignCalloutListElement = (props: Props) =>
  createReactElementSpec(createCampaignCalloutListFields(props), () => {
    return <CampaignCalloutList campaignList={[]} />;
  });
