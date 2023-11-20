import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { altStyleFields } from "./AltStyleElementSpec";

export const AltStyleElementTestId = "AltStyleElement";

export const altStyleElement = createReactElementSpec({
  fieldDescriptions: altStyleFields,
  consumer: ({ fields, useAlternateStyles }) => (
    <FieldLayoutVertical
      data-cy={AltStyleElementTestId}
      useAlternateStyles={useAlternateStyles}
    >
      <FieldWrapper
        headingLabel="Title"
        field={fields.title}
        useAlternateStyles={useAlternateStyles}
      />
      <FieldWrapper
        headingLabel="Content"
        field={fields.content}
        useAlternateStyles={useAlternateStyles}
      />
    </FieldLayoutVertical>
  ),
  useAlternateStyles: true,
});
