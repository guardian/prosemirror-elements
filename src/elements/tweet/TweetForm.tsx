import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { EmbedTestId } from "../embed/EmbedForm";
import { Preview } from "../helpers/Preview";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { TrackingStatusChecks } from "../helpers/ThirdPartyStatusChecks";
import type { createTweetFields } from "./TweetSpec";

type Props = {
  fields: FieldNameToField<ReturnType<typeof createTweetFields>>;
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
};

export const TweetForm: React.FunctionComponent<Props> = ({
  fields,
  checkThirdPartyTracking,
}) => (
  <div>
    <FieldLayoutVertical data-cy={EmbedTestId}>
      <Preview html={fields.html.value} />
      <CustomDropdownView field={fields.role} label="Weighting" />
      <CustomCheckboxView
        field={fields.isMandatory}
        label="This element is required for publication"
      />
      <TrackingStatusChecks
        html={fields.html.value}
        isMandatory={fields.isMandatory.value}
        checkThirdPartyTracking={checkThirdPartyTracking}
      />
    </FieldLayoutVertical>
  </div>
);
