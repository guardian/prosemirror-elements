import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { Link } from "../../editorial-source-components/Link";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Preview } from "../helpers/Preview";
import { TrackingStatusChecks } from "../helpers/ThirdPartyStatusChecks";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import type { createInteractiveFields } from "./InteractiveSpec";

type Props = {
  fields: FieldNameToField<ReturnType<typeof createInteractiveFields>>;
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
};

export const InteractiveElementTestId = "InteractiveElement";

export const InteractiveElementForm: React.FunctionComponent<Props> = ({
  fields,
  checkThirdPartyTracking,
}) => (
  <FieldLayoutVertical data-cy={InteractiveElementTestId}>
    <Preview
      headingLabel="Interactive"
      headingContent={
        <span>
          &nbsp;
          <Link target="_blank" rel="noopener" href={fields.originalUrl.value}>
            (original url ↪)
          </Link>
        </span>
      }
      html={fields.html.value}
      iframeUrl={fields.iframeUrl.value}
    />
    <CustomDropdownView field={fields.role} label="Weighting" />
    <FieldWrapper field={fields.alt} headingLabel="Alt text" />
    <FieldWrapper field={fields.caption} headingLabel="Caption" />
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
);
