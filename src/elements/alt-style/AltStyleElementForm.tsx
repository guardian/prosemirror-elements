import styled from "@emotion/styled";
import { neutral } from "@guardian/src-foundations";
import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { RepeaterFieldMapIDKey } from "../../plugin/helpers/constants";
import { AltStyleElementWrapper } from "../../renderers/react/AltStyleElementWrapper";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { Body } from "../../renderers/react/ElementWrapper";
import {
  LeftRepeaterActionControls,
  RightRepeaterActionControls,
} from "../../renderers/react/WrapperControls";
import { altStyleFields } from "./AltStyleElementSpec";

export const AltStyleElementTestId = "AltStyleElement";

const RepeaterBody = styled(Body)`
  padding: 8px 8px 16px 8px;
  background-color: ${neutral[97]};
  &:not(:last-child) {
    border-bottom: 1px dashed ${neutral[60]};
  }
  position: relative;
`;

const RepeaterChild = styled("div")`
  width: 100%;
  padding: 0 8px;
`;

const ChildNumber = styled("div")`
  position: absolute;
  top: 16px;
  left: 8px;
  background-color: ${neutral[97]};
  color: ${neutral[46]};
  font-family: "Guardian Agate Sans", sans-serif;
  line-height: 1;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  padding: 4px;
  width: 24px;
  border: 1px solid ${neutral[60]};
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
          <ChildNumber>{index + 1}</ChildNumber>
          <LeftRepeaterActionControls
            remove={() => fields.repeater.view.remove(index)}
            numberOfChildNodes={children.length}
          />
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
