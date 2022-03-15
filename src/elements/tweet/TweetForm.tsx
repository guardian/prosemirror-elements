import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { EmbedTestId } from "../embed/EmbedForm";
import { Preview } from "../helpers/Preview";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { TrackingStatusChecks } from "../helpers/ThirdPartyStatusChecks";
import type { createTweetFields } from "./TweetSpec";

type Props = {
  fieldValues: FieldNameToValueMap<ReturnType<typeof createTweetFields>>;
  errors: FieldValidationErrors;
  fields: FieldNameToField<ReturnType<typeof createTweetFields>>;
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
};

export const TweetForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
  fieldValues,
  checkThirdPartyTracking,
}) => (
  <div>
    <FieldLayoutVertical data-cy={EmbedTestId}>
      <Preview html={fieldValues.html} />
      <CustomDropdownView
        field={fields.role}
        label="Weighting"
        errors={errors.role}
      />
      <CustomCheckboxView
        field={fields.isMandatory}
        errors={errors.isMandatory}
        label="This element is required for publication"
      />
      <TrackingStatusChecks
        html={fieldValues.html}
        isMandatory={fieldValues.isMandatory}
        checkThirdPartyTracking={checkThirdPartyTracking}
      />
    </FieldLayoutVertical>
  </div>
);
