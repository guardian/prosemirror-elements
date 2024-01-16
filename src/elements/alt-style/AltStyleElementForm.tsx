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
      {fields.repeater.children.map((repeater, index) => (
        <div key={index}>
          <FieldWrapper
            headingLabel="Key Takeaway Title"
            field={repeater.title}
            useAlternateStyles={true}
          />
          <FieldWrapper
            headingLabel="Key Takeaway Content"
            field={repeater.content}
            useAlternateStyles={true}
          />
        </div>
      ))}
      <button onClick={() => fields.repeater.view.add()}>+</button>
    </FieldLayoutVertical>
  ),
  wrapperComponent: AltStyleElementWrapper,
});
