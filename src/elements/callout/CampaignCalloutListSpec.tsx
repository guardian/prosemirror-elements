import React, { useEffect, useState } from "react";
import { Label } from "../../editorial-source-components/Label";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { dropDownRequired } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { CalloutError, calloutStyles, CalloutTable } from "../embed/Callout";
import { undefinedDropdownValue } from "../helpers/transform";

type Fields = {
  callout: string;
  formId: number;
  tagName: string;
  description?: string;
  formUrl?: string;
  _type: string;
};

type Rules = {
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

const generatePreviewHtml = (title: string) => {
  return `<div data-callout-tagname="${title}">
                            <h2>Callout</h2>
                            <p>${title}</p>
                        </div>`;
};
export const campaignCalloutListFields = {
  campaignId: createCustomDropdownField(
    undefinedDropdownValue,
    [],
    [dropDownRequired(undefined, "WARN")]
  ),
  html: createCustomField<string, string>("html", "default"),
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

      useEffect(() => {
        if (callout) {
          const previewHtml = generatePreviewHtml(callout.name);
          fields.html.view.update(previewHtml);
        }
      }, [campaignId]);

      const getTag = (id: string) => {
        const campaign = campaignList.find((campaign) => campaign.id === id);
        return campaign?.fields.tagName ?? "";
      };

      const dropdownOptions = getDropdownOptionsFromCampaignList(campaignList);
      const callout = campaignList.find(
        (campaign) => campaign.id === fieldValues.campaignId
      );

      return campaignId && campaignId != "none-selected" ? (
        <div css={calloutStyles}>
          <Label>Callout</Label>
          {callout ? (
            <CalloutTable calloutData={callout} targetingUrl={targetingUrl} />
          ) : (
            <CalloutError
              tag={getTag(campaignId)}
              targetingUrl={targetingUrl}
            />
          )}
        </div>
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
