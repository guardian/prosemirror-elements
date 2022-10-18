import React, { useEffect, useState } from "react";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { dropDownRequired } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { CalloutError, calloutStyles } from "../embed/Callout";
import { undefinedDropdownValue } from "../helpers/transform";
import { CalloutTable } from "./CalloutTable";

export type Fields = {
  callout: string;
  formId: number;
  tagName: string;
  description?: string;
  formUrl?: string;
  _type: string;
};

export type Rules = {
  requiredTags: string[];
  lackingTags: string[];
  matchAllTags: boolean;
};

export type Campaign = {
  id: string;
  name: string;
  fields: Fields;
  rules: Rules[];
  priority: number;
  displayOnSensitive: boolean;
  activeFrom?: number;
  activeUntil?: number;
};

type Props = {
  fetchCampaignList: () => Promise<Campaign[]>;
  targetingUrl: string;
  applyTag: (tagId: string) => void;
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

export const calloutFields = {
  campaignId: createCustomDropdownField(
    undefinedDropdownValue,
    [],
    [dropDownRequired(undefined, "WARN")]
  ),
  isNonCollapsible: createCustomField(false, true),
};

export const createCalloutElement = ({
  fetchCampaignList,
  targetingUrl,
  applyTag,
}: Props) =>
  createReactElementSpec(calloutFields, ({ fields }) => {
    const campaignId = fields.campaignId.value;
    const [campaignList, setCampaignList] = useState<Campaign[]>([]);
    useEffect(() => {
      void fetchCampaignList().then((campaignList) => {
        setCampaignList(campaignList);
      });
    }, []);

    useEffect(() => {
      if (campaignId === undefinedDropdownValue || campaignList.length === 0) {
        return;
      }
      applyTag(getTag(campaignId));
    }, [campaignId]);

    const getTag = (id: string) => {
      const campaign = campaignList.find((campaign) => campaign.id === id);
      return campaign?.fields.tagName ?? "";
    };

    const dropdownOptions = getDropdownOptionsFromCampaignList(campaignList);
    const callout = campaignList.find((campaign) => campaign.id === campaignId);

    const trimmedTargetingUrl = targetingUrl.replace(/\/$/, "");
    return campaignId && campaignId != "none-selected" ? (
      <div css={calloutStyles}>
        {callout ? (
          <CalloutTable
            calloutData={callout}
            targetingUrl={trimmedTargetingUrl}
            isNonCollapsible={fields.isNonCollapsible}
          />
        ) : (
          <CalloutError
            tag={getTag(campaignId)}
            targetingUrl={trimmedTargetingUrl}
          />
        )}
      </div>
    ) : (
      <div>
        <CustomDropdownView
          label="Callout"
          field={fields.campaignId}
          options={dropdownOptions}
        />
      </div>
    );
  });
