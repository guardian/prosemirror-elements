import { css } from "@emotion/react";
import { neutral, space } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";
import React, { useEffect, useState } from "react";
import { createCheckBoxField } from "../../plugin/fieldViews/CheckboxFieldView";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import { dropDownRequired } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { CalloutError } from "./CalloutError";
import { CalloutTable } from "./CalloutTable";
import type { Campaign } from "./CalloutTypes";

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
    [
      dropDownRequired(
        "A current campaign must be selected for the callout to appear",
        "WARN"
      ),
    ]
  ),
  isNonCollapsible: createCustomField(false, true),
  tagId: createTextField(),
  useDefaultPrompt: createCheckBoxField(true),
  overridePrompt: createTextField({
    placeholder: "Don't show prompt",
  }),
  useDefaultTitle: createCheckBoxField(true),
  overrideTitle: createTextField({
    placeholder: "Don't show title",
  }),
  useDefaultDescription: createCheckBoxField(true),
  overrideDescription: createRichTextField({
    placeholder: "Don't show description",
    isResizeable: true,
    marks: "em strong link",
  }),
};

const calloutStyles = css`
  ${textSans.small({ fontWeight: "regular", lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";

  code {
    font-family: monospace;
    background-color: ${neutral[86]};
    border-radius: ${space[1]}px;
    padding: 1px 4px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid ${neutral[86]};
    font-size: 14px;
  }
  th,
  tr,
  td {
    border: 1px solid ${neutral[86]};
    padding: ${space[1]}px;
    line-height: 14px;
    vertical-align: top;
  }
  th {
    text-align: left;
  }
  p,
  p:first-child {
    margin-top: 0px;
    margin-bottom: 0px;
  }
  ul {
    margin-bottom: 0px;
  }
`;

type Props = {
  fetchCampaignList: () => Promise<Campaign[]>;
  targetingUrl: string;
};

export const createCalloutElement = ({
  fetchCampaignList,
  targetingUrl,
}: Props) =>
  createReactElementSpec({
    fieldDescriptions: calloutFields,
    consumer: ({ fields }) => {
      const campaignId = fields.campaignId.value;
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
      const callout = campaignList.find(
        (campaign) => campaign.id === campaignId
      );
      const isActiveCallout =
        !callout?.activeUntil || callout.activeUntil >= Date.now();
      const trimmedTargetingUrl = targetingUrl.replace(/\/$/, "");

      return campaignId && campaignId != "none-selected" ? (
        <div css={calloutStyles}>
          {callout && isActiveCallout ? (
            <CalloutTable
              calloutData={callout}
              targetingUrl={trimmedTargetingUrl}
              isNonCollapsible={fields.isNonCollapsible}
              useDefaultPrompt={fields.useDefaultPrompt}
              overridePrompt={fields.overridePrompt}
              useDefaultTitle={fields.useDefaultTitle}
              overrideTitle={fields.overrideTitle}
              useDefaultDescription={fields.useDefaultDescription}
              overrideDescription={fields.overrideDescription}
            />
          ) : (
            <CalloutError
              isExpired={!isActiveCallout}
              targetingUrl={trimmedTargetingUrl}
              callout={callout}
              calloutId={campaignId}
            />
          )}
        </div>
      ) : (
        <div>
          <CustomDropdownView
            label="Callout"
            field={fields.campaignId}
            options={dropdownOptions}
            onChange={(value) => {
              const tagId = getTag(value);
              fields.tagId.update(tagId);
            }}
          />
        </div>
      );
    },
  });
