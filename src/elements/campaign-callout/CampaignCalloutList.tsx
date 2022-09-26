import React from "react";
import { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { createCampaignCalloutListFields } from "./CampaignCalloutListSpec";
type Props = {
  fields: FieldNameToField<ReturnType<typeof createCampaignCalloutListFields>>;
};

export const CampaignCalloutList: React.FunctionComponent<Props> = ({
  fields,
}) => {
  return (
    <div>
      <CustomDropdownView label="campaign list" field={fields.campaignList} />
    </div>
  );
};
