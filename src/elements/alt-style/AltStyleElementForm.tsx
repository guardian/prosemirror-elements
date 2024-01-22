import styled from "@emotion/styled";
import { neutral } from "@guardian/src-foundations";
import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { RepeaterFieldMapIDKey } from "../../plugin/helpers/constants";
import { AltStyleElementWrapper } from "../../renderers/react/AltStyleElementWrapper";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { Body } from "../../renderers/react/ElementWrapper";
import { RightRepeaterActionControls } from "../../renderers/react/WrapperControls";
import { altStyleFields } from "./AltStyleElementSpec";

export const AltStyleElementTestId = "AltStyleElement";

const RepeaterBody = styled(Body)`
  padding: 0 8px 8px 8px;
  border: 1px solid ${neutral[60]};
  margin-top: 8px;
`;

const RepeaterChild = styled("div")`
  width: 100%;
  padding-right: 8px;
`;

export const altStyleElement = createReactElementSpec({
  fieldDescriptions: altStyleFields,
  component: ({ fields }) => (
    <FieldLayoutVertical
      data-cy={AltStyleElementTestId}
      useAlternateStyles={true}
    >
      {fields.repeater.children.map((repeater, index, children) => (
        <RepeaterBody>
          {/*Use field index as key to avoid React render conflicts*/}
          <RepeaterChild key={repeater[RepeaterFieldMapIDKey]}>
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
          </RepeaterChild>
          <RightRepeaterActionControls
            add={() => fields.repeater.view.add(index)}
            remove={() => fields.repeater.view.remove(index)}
            moveUp={() => fields.repeater.view.moveUp(index)}
            moveDown={() => fields.repeater.view.moveDown(index)}
            numberOfChildNodes={children.length}
            index={index}
          />
        </RepeaterBody>
      ))}
    </FieldLayoutVertical>
  ),
  wrapperComponent: AltStyleElementWrapper,
});
