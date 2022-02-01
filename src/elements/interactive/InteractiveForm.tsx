import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { Link } from "../../editorial-source-components/Link";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Preview } from "../helpers/Preview";
import { TrackingStatusChecks } from "../helpers/ThirdPartyStatusChecks";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import type { createInteractiveFields } from "./InteractiveSpec";

type Props = {
  fieldValues: FieldNameToValueMap<ReturnType<typeof createInteractiveFields>>;
  errors: FieldValidationErrors;
  fields: FieldNameToField<ReturnType<typeof createInteractiveFields>>;
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
};

export const InteractiveElementTestId = "InteractiveElement";

export const InteractiveElementForm: React.FunctionComponent<Props> = ({
  fieldValues,
  errors,
  fields,
  checkThirdPartyTracking,
}) => (
  <FieldLayoutVertical data-cy={InteractiveElementTestId}>
    <Preview
      headingLabel="Interactive"
      headingContent={
        <span>
          &nbsp;<Link href={fieldValues.originalUrl}>(original url ↪)</Link>
        </span>
      }
      html={fieldValues.html}
      iframeUrl={fieldValues.iframeUrl}
    />
    <CustomDropdownView
      field={fields.role}
      label="Weighting"
      errors={errors.role}
    />
    <FieldWrapper
      field={fields.alt}
      errors={errors.alt}
      headingLabel="Alt text"
    />
    <FieldWrapper
      field={fields.caption}
      errors={errors.caption}
      headingLabel="Caption"
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
);
