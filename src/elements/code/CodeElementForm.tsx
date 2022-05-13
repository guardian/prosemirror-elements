import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { codeFields } from "./CodeElementSpec";

type Props = {
  fields: FieldNameToField<typeof codeFields>;
};

export const CodeElementTestId = "CodeElement";

export const CodeElementForm: React.FunctionComponent<Props> = ({ fields }) => (
  <FieldLayoutVertical data-cy={CodeElementTestId}>
    <FieldWrapper headingLabel="Code" field={fields.html} />
    <CustomDropdownView
      label="Language"
      field={fields.language}
      display="inline"
    />
  </FieldLayoutVertical>
);
