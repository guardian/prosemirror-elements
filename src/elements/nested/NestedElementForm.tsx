import styled from "@emotion/styled";
import { neutral, space } from "@guardian/src-foundations";
import React from "react";
import { DemoFieldWrapper } from "../../editorial-source-components/DemoFieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import {
  actionSpacing,
  buttonWidth,
  RepeaterFieldMapIDKey,
} from "../../plugin/helpers/constants";
import { AltStyleElementWrapper } from "../../renderers/react/AltStyleElementWrapper";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { Body } from "../../renderers/react/ElementWrapper";
import {
  LeftRepeaterActionControls,
  RightRepeaterActionControls,
} from "../../renderers/react/WrapperControls";
import { nestedElementFields } from "./NestedElement";

export const AltStyleElementTestId = "AltStyleElement";

export const RepeaterChild = styled(Body)`
  &:first-child {
    margin-top: ${space[3]}px;
  }
  margin-bottom: ${space[3]}px;
  position: relative;
  &:not(:hover) .actions,
  &:not(:focus-within) .actions {
    opacity: 0;
  }
  &:hover .actions,
  &:focus-within .actions {
    opacity: 1;
  }
`;

export const RepeatedFieldsWrapper = styled("div")`
  width: 100%;
`;

export const ChildNumber = styled("div")`
  box-sizing: border-box;
  background-color: ${neutral[100]};
  color: ${neutral[46]};
  font-family: "Guardian Agate Sans", sans-serif;
  line-height: 1;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${buttonWidth}px;
  width: ${buttonWidth}px;
  top: 0;
  left: -${actionSpacing - 1}px; // -1 ensures border of number overlaps/collapses into border of first field
  padding: 2px;
  border: 1px solid ${neutral[60]};
  position: absolute;
`;

export const nestedElement = createReactElementSpec({
  fieldDescriptions: nestedElementFields,
  component: ({ fields }) => {
    return (
      <FieldLayoutVertical
        data-cy={AltStyleElementTestId}
        useAlternateStyles={true}
      >
        {fields.repeater.children.map((child, index) => (
          // Use field ID as key instead of node index to avoid React render conflicts
          <RepeaterChild key={child[RepeaterFieldMapIDKey]}>
            <ChildNumber>{index + 1}</ChildNumber>
            <LeftRepeaterActionControls
              removeChildAt={() => fields.repeater.view.removeChildAt(index)}
              numberOfChildNodes={fields.repeater.children.length}
              minChildren={fields.repeater.view.minChildren}
            />
            <RepeatedFieldsWrapper>
              <DemoFieldWrapper
                field={child.content}
                showHeading={false}
                useAlternateStyles={true}
              />
            </RepeatedFieldsWrapper>
            <RightRepeaterActionControls
              addChildAfter={() => fields.repeater.view.addChildAfter(index)}
              moveChildUpOne={() => fields.repeater.view.moveChildUpOne(index)}
              moveChildDownOne={() =>
                fields.repeater.view.moveChildDownOne(index)
              }
              numberOfChildNodes={fields.repeater.children.length}
              index={index}
            />
          </RepeaterChild>
        ))}
      </FieldLayoutVertical>
    );
  },
  wrapperComponent: AltStyleElementWrapper,
});
