import React, { useEffect, useState } from "react";
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { dropDownRequired } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Callout } from "../embed/Callout";
import { undefinedDropdownValue } from "../helpers/transform";

type Fields = {
  callout?: string;
  formId?: number;
  tagName?: string;
  description?: string;
  formUrl?: string;
  _type?: string;
};

type Rules = {
  requiredTags?: string[];
  lackingTags?: string[];
  matchAllTags?: boolean;
};
export type Campaign = {
  id: string;
  fields?: Fields;
  rules?: Rules[];
  priority?: number;
  displayOnSensitive?: boolean;
  activeFrom?: number;
  activeUntil?: number;
  name: string;
};
type Props = {
  fetchCampaignList: () => Promise<Campaign[]>;
  targetingUrl: string;
};

const getDropdownOptionsFromCampaignList = (campaignList: Campaign[]) => {
  const campaigns = campaignList.map((campaign) => {
    const name = campaign.name.replace("CALLOUT:", "").trimStart();
    return { text: name, value: campaign.id };
  });

  return [
    { text: "Select from open callouts", value: undefinedDropdownValue },
    ...campaigns,
  ];
};

export const campaignCalloutListFields = {
  campaignId: createCustomDropdownField(
    undefinedDropdownValue,
    [],
    [dropDownRequired(undefined, "WARN")]
  ),
};

export const createCampaignCalloutListElement = ({
  fetchCampaignList,
  targetingUrl,
}: Props) =>
  createReactElementSpec(
    campaignCalloutListFields,
    ({ fields, fieldValues, errors }) => {
      const { campaignId } = fieldValues;

      const [campaignList, setCampaignList] = useState<Campaign[]>([]);
      useEffect(() => {
        void fetchCampaignList().then((campaignList) => {
          setCampaignList(campaignList);
        });
      }, []);

      const getTag = (id: string) => {
        const campaign = campaignList.find((campaign) => campaign.id === id);
        return campaign?.fields.tagName ?? "";
      };

      const dropdownOptions = getDropdownOptionsFromCampaignList(campaignList);

      return campaignId && campaignId != "none-selected" ? (
        <Callout tag={getTag(campaignId)} targetingUrl={targetingUrl} />
      ) : (
        <div>
          <CustomDropdownView
            label="Callout"
            field={fields.campaignId}
            errors={errors.campaignId}
            options={dropdownOptions}
          />
        </div>
      );
    }
  );
