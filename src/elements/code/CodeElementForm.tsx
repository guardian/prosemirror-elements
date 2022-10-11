import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { codeFields } from "./CodeElementSpec";

export const CodeElementTestId = "CodeElement";

export const codeElement = createReactElementSpec(codeFields, ({ fields }) => (
  <FieldLayoutVertical data-cy={CodeElementTestId}>
    <FieldWrapper headingLabel="Code" field={fields.html} />
    <CustomDropdownView
      label="Language"
      field={fields.language}
      display="inline"
    />
  </FieldLayoutVertical>
));
