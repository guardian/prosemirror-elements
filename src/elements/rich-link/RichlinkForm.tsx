import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { richlinkFields } from "./RichlinkSpec";

type Props = {
  fieldValues: FieldNameToValueMap<typeof richlinkFields>;
  errors: FieldValidationErrors;
  fields: FieldNameToField<typeof richlinkFields>;
};

export const RichlinkElementTestId = "RichlinkElement";

export const RichlinkElementForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
  fieldValues,
}) => (
  <FieldLayoutVertical data-cy={RichlinkElementTestId}>
    <CustomDropdownView
      field={fields.weighting}
      label="Weighting"
      errors={errors.weighting}
    />
    <a href={fieldValues.url}>{fieldValues.linkText}</a>
  </FieldLayoutVertical>
);
