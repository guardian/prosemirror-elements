import React from "react";
import { Field } from "../../editorial-source-components/Field";
import type { FieldNameToFieldViewSpec } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { createCodeFields } from "./CodeElementSpec";

type Props = {
  errors: Record<string, string[]>;
  fieldViewSpecs: FieldNameToFieldViewSpec<ReturnType<typeof createCodeFields>>;
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
    <CustomDropdownView fieldViewSpec={fieldViewSpecs.language} />
  </div>
);
