import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { TrackingChecker } from "../../editorial-source-components/TrackingChecker";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { createEmbedFields } from "./EmbedSpec";

type Props = {
  fieldValues: FieldNameToValueMap<ReturnType<typeof createEmbedFields>>;
  errors: FieldValidationErrors;
  fields: FieldNameToField<ReturnType<typeof createEmbedFields>>;
  checkEmbedTracking: (html: string) => Promise<any>;
};

export const EmbedElementTestId = "EmbedElement";

export const EmbedElementForm: React.FunctionComponent<Props> = ({
  fieldValues,
  errors,
  fields,
  checkEmbedTracking,
}) => (
  <FieldLayoutVertical data-cy={EmbedElementTestId}>
    <CustomDropdownView
      field={fields.role}
      label="Weighting"
      errors={errors.role}
    />
    <FieldWrapper field={fields.url} errors={errors.url} label="Source URL" />
    <FieldWrapper field={fields.html} errors={errors.html} label="Embed code" />
    <FieldWrapper
      field={fields.caption}
      errors={errors.caption}
      label="Caption"
    />
    <FieldWrapper field={fields.alt} errors={errors.alt} label="Alt text" />
    <CustomCheckboxView
      field={fields.isMandatory}
      errors={errors.isMandatory}
      label="This element is required for publication"
    />
    <TrackingChecker
      html={fieldValues.html}
      checkEmbedTracking={checkEmbedTracking}
    />
  </FieldLayoutVertical>
);
