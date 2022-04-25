import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { FieldNameToField } from "../../plugin/types/Element";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { TrackingStatusChecks } from "../helpers/ThirdPartyStatusChecks";
import { htmlLength } from "../helpers/validation";
import type { createFormFields } from "./FormElementSpec";
import { signedOutAltTextMaxLength } from "./FormElementSpec";

type Props = {
  errors: FieldValidationErrors;
  fields: FieldNameToField<ReturnType<typeof createFormFields>>;
  fieldValues: FieldNameToValueMap<ReturnType<typeof createFormFields>>;
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
};

export const FormElementForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
  fieldValues,
  checkThirdPartyTracking,
}) => (
  <FieldLayoutVertical>
    <a href={fieldValues.originalUrl}>Edit on Formstack</a>
    <FieldWrapper
      headingLabel="Signed out text"
      field={fields.signedOutAltText}
      errors={errors.signedOutAltText}
      description={`${htmlLength(
        fieldValues.signedOutAltText
      )}/${signedOutAltTextMaxLength} characters`}
    />
    <TrackingStatusChecks
      html={fieldValues.html}
      isMandatory={fieldValues.isMandatory}
      checkThirdPartyTracking={checkThirdPartyTracking}
    />
  </FieldLayoutVertical>
);
