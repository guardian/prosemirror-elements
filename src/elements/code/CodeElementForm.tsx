import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { codeFields } from "./CodeElementSpec";

type Props = {
  errors: FieldValidationErrors;
  fields: FieldNameToField<typeof codeFields>;
};

export const CodeElementTestId = "CodeElement";

export const CodeElementForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
}) => (
  <FieldLayoutVertical data-cy={CodeElementTestId}>
    <FieldWrapper label="Code" field={fields.html} errors={errors.html} />
    <CustomDropdownView
      label="Language"
      field={fields.language}
      display="inline"
    />
  </FieldLayoutVertical>
);
