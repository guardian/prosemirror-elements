import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { DemoFieldWrapper } from "../../editorial-source-components/DemoFieldWrapper";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { codeFields } from "./CodeElementSpec";

export const CodeElementTestId = "CodeElement";

export const codeElement = createReactElementSpec({
  fieldDescriptions: codeFields,
  component: ({ fields }) => (
    <FieldLayoutVertical data-cy={CodeElementTestId}>
      <DemoFieldWrapper headingLabel="Code" field={fields.html} />
      <CustomDropdownView
        label="Language"
        field={fields.language}
        display="inline"
      />
    </FieldLayoutVertical>
  ),
});
