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
    <FieldLayoutVertical useAlternateStyles={true}>
        {
            fields.takeaways.children.map((takeaway, index) => (
                <div key={`takeaway-${index}`}>
                    <FieldWrapper headingLabel="Title" field={takeaway.title} useAlternateStyles={true}/>
                    <FieldWrapper headingLabel="Content" field={takeaway.content} useAlternateStyles={true} />
                </div>
            ))
        }
        <button
        onClick={() => fields.takeaways.view.add()}
        >
        +
        </button>
    </FieldLayoutVertical>
),
  wrapperComponent: AltStyleElementWrapper,
});
