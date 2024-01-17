import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { RepeaterFieldMapIDKey } from "../../plugin/helpers/constants";
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
        // Use field index to avoid React render conflicts
        <>
          <div key={repeater[RepeaterFieldMapIDKey]}>
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
          <button onClick={() => fields.repeater.view.add(index)}>+</button>
          <button
            onClick={() => fields.repeater.view.remove(index)}
            disabled={fields.repeater.children.length === 1}
          >
            -
          </button>
        </>
      ))}
    </FieldLayoutVertical>
  ),
  wrapperComponent: AltStyleElementWrapper,
});
