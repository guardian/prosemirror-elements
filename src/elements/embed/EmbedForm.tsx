import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { embedFields } from "./EmbedSpec";

type Props = {
  fieldValues: FieldNameToValueMap<typeof embedFields>;
  errors: FieldValidationErrors;
  fields: FieldNameToField<typeof embedFields>;
};

export const EmbedElementTestId = "EmbedElement";

export const EmbedElementForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
}) => (
  <FieldLayoutVertical data-cy={EmbedElementTestId}>
    <CustomDropdownView
      field={fields.weighting}
      label="Weighting"
      errors={errors.weighting}
    />
    <FieldWrapper
      field={fields.sourceUrl}
      errors={errors.sourceUrl}
      headingLabel="Source URL"
    />
    <FieldWrapper
      field={fields.embedCode}
      errors={errors.embedCode}
      headingLabel="Embed code"
    />
    <FieldWrapper
      field={fields.caption}
      errors={errors.caption}
      headingLabel="Caption"
    />
    <FieldWrapper
      field={fields.altText}
      errors={errors.altText}
      headingLabel="Alt text"
    />
    <CustomCheckboxView
      field={fields.required}
      errors={errors.required}
      label="This element is required for publication"
    />
  </FieldLayoutVertical>
);
