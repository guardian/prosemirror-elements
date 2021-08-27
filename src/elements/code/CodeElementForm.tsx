import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { codeFields } from "./CodeElementSpec";

type Props = {
  errors: Record<string, string[]>;
  fields: FieldNameToField<typeof codeFields>;
};

export const CodeElementTestId = "CodeElement";

export const CodeElementForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
}) => (
  <div data-cy={CodeElementTestId}>
    <FieldWrapper
      label="Code"
      field={fields.codeText}
      errors={errors.codeText}
    />
    <CustomDropdownView
      label="Language"
      display="inline"
      field={fields.language}
    />
  </div>
);
