import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { altStyleFields } from "./AltStyleElementSpec";
import { AltStyleElementWrapper } from "../../renderers/react/AltStyleElementWrapper";

export const AltStyleElementTestId = "AltStyleElement";

export const altStyleElement = createReactElementSpec({
  fieldDescriptions: altStyleFields,
  consumer: ({ fields }) => (
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
  elementWrapper: AltStyleElementWrapper
});
