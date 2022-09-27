import React, { useState } from "react";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Callout } from "../embed/Callout";
import type {
  Campaign,
  createCampaignCalloutListFields,
} from "./CampaignCalloutListSpec";

type Props = {
  fields: FieldNameToField<ReturnType<typeof createCampaignCalloutListFields>>;
  campaigns: Campaign[];
};

export const CampaignCalloutList: React.FunctionComponent<Props> = ({
  fields,
  campaigns,
}) => {
  //const view = fields.campaignList.view;
  // how do we access the view.node.attrs.field to get the stored id value
  const [calloutId, setCalloutId] = useState<string>();

  const onChange = (calloutId: string) => {
    setCalloutId(calloutId);
  };

  const getTag = (id: string) => {
    const campaign = campaigns.find((campaign) => campaign.id === id);
    return campaign?.fields.tagName ?? "";
  };

  return calloutId ? (
    <Callout
      tag={getTag(calloutId)}
      targetingUrl={"https://targeting.code.dev-gutools.co.uk/"}
    />
  ) : (
    <div>
      <CustomDropdownView
        label="Callout"
        field={fields.campaignList}
        changeHandler={onChange}
      />
    </div>
  );
};
