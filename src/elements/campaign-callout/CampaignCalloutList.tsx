import React, { useEffect, useState } from "react";
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
  const [calloutId, setCalloutId] = useState<string>();

  useEffect(() => {
    const view = fields.campaignList.view;
    view.subscribe(setCalloutId);
    return () => view.unsubscribe(setCalloutId);
  }, []);

  const getTag = (id: string) => {
    const campaign = campaigns.find((campaign) => campaign.id === id);
    return campaign?.fields.tagName ?? "";
  };

  return calloutId && calloutId != "none-selected" ? (
    <Callout
      tag={getTag(calloutId)}
      targetingUrl={"https://targeting.code.dev-gutools.co.uk/"}
    />
  ) : (
    <div>
      <CustomDropdownView label="Callout" field={fields.campaignList} />
    </div>
  );
};
