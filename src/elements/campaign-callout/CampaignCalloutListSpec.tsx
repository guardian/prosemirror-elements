import React from "react";
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Callout } from "../embed/Callout";
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
export type Campaign = {
  id: string;
  fields: Fields;
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
    const name = campaign.name.replace("CALLOUT:", "").trimStart();
    return { text: name, value: campaign.id };
  });

  return [
    { text: "Select from open callouts", value: undefinedDropdownValue },
    ...campaigns,
  ];
};

export const createCampaignCalloutListFields = (props: Props) => {
  return {
    campaignId: createCustomDropdownField(
      undefinedDropdownValue,
      getCampaignList(props)
    ),
  };
};

export const createCampaignCalloutListElement = (props: Props) =>
  createReactElementSpec(
    createCampaignCalloutListFields(props),
    ({ fields, fieldValues }) => {
      const { campaignId } = fieldValues;

      const getTag = (id: string) => {
        const campaign = props.campaignList.find(
          (campaign) => campaign.id === id
        );
        return campaign?.fields.tagName ?? "";
      };

      return campaignId && campaignId != "none-selected" ? (
        <Callout
          tag={getTag(campaignId)}
          targetingUrl={"https://targeting.code.dev-gutools.co.uk/"}
        />
      ) : (
        <div>
          <CustomDropdownView label="Callout" field={fields.campaignId} />
        </div>
      );
    }
  );
