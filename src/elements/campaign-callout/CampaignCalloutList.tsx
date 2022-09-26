import React from "react";
type Props = {
  campaignList: Array<{
    id: String;
  }>;
};

export const CampaignCalloutList: React.FunctionComponent<Props> = ({
  campaignList,
}) => {
  return <div>hello campaign callout</div>;
};
