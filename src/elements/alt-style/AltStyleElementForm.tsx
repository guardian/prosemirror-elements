import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { AltStyleElementWrapper } from "../../renderers/react/AltStyleElementWrapper";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { altStyleFields } from "./AltStyleElementSpec";

export const AltStyleElementTestId = "AltStyleElement";

export const altStyleElement = createReactElementSpec({
  fieldDescriptions: altStyleFields,
  component: ({ fields }) => (
    <FieldLayoutVertical
      data-cy={AltStyleElementTestId}
      useAlternateStyles={true}
    >
      <FieldWrapper
        headingLabel="Title"
        field={fields.title}
        useAlternateStyles={true}
      />
      <FieldWrapper
        headingLabel="Content"
        field={fields.content}
        useAlternateStyles={true}
      />
    </FieldLayoutVertical>
  ),
  wrapperComponent: AltStyleElementWrapper,
});
