import React from "react";
import { Field } from "../../editorial-source-components/Field";
import type { FieldNameToFieldViewSpec } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { codeFields } from "./CodeElementSpec";

type Props = {
  errors: Record<string, string[]>;
  fieldViewSpecs: FieldNameToFieldViewSpec<typeof codeFields>;
};

export const CodeElementTestId = "CodeElement";

export const CodeElementForm: React.FunctionComponent<Props> = ({
  errors,
  fieldViewSpecs,
}) => (
  <div data-cy={CodeElementTestId}>
    <Field
      label="Code"
      fieldViewSpec={fieldViewSpecs.codeText}
      errors={errors.codeText}
    />
    <CustomDropdownView
      label="Language"
      fieldViewSpec={fieldViewSpecs.language}
    />
  </div>
);
