import styled from "@emotion/styled";
import { neutral, space } from "@guardian/src-foundations";
import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { RepeaterFieldMapIDKey } from "../../plugin/helpers/constants";
import type {
  FieldDescriptions,
  FieldNameToField,
  RepeaterField,
} from "../../plugin/types/Element";
import { AltStyleElementWrapper } from "../../renderers/react/AltStyleElementWrapper";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { Body } from "../../renderers/react/ElementWrapper";
import {
  LeftRepeaterActionControls,
  RightRepeaterActionControls,
} from "../../renderers/react/WrapperControls";
import { keyTakeawaysFields } from "./AltStyleElementSpec";

export const AltStyleElementTestId = "AltStyleElement";

const RepeaterChild = styled(Body)`
  &:first-child {
    margin-top: ${space[3]}px;
  }
  margin-bottom: ${space[3]}px;
  position: relative;
`;

const RepeatedFieldsWrapper = styled("div")`
  width: 100%;
`;

const ChildNumber = styled("div")`
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
  height: 32px;
  padding: 2px;
  width: 32px;
  border: 1px solid ${neutral[60]};
  position: absolute;
  top: 0;
  left: -32px;
`;

export const createReactAltStylesElementSpec = <
  FDesc extends FieldDescriptions<string>,
  RepeatedFieldDescriptions extends FieldDescriptions<string>
>(
  fieldDescriptions: FDesc,
  repeaterFieldExtractor: (
    fields: FieldNameToField<FDesc>
  ) => RepeaterField<RepeatedFieldDescriptions>,
  renderRepeaterChild: (
    repeaterChild: FieldNameToField<RepeatedFieldDescriptions>
  ) => React.ReactNode
) =>
  createReactElementSpec({
    fieldDescriptions,
    component: ({ fields }) => {
      const repeaterField = repeaterFieldExtractor(fields);
      return (
        <FieldLayoutVertical
          data-cy={AltStyleElementTestId}
          useAlternateStyles={true}
        >
          {repeaterField.children.map((child, index) => (
            // Use field ID as key instead of node index to avoid React render conflicts
            <RepeaterChild key={child[RepeaterFieldMapIDKey]}>
              <ChildNumber>{index + 1}</ChildNumber>
              <LeftRepeaterActionControls
                removeChildAt={() => repeaterField.view.removeChildAt(index)}
                numberOfChildNodes={repeaterField.children.length}
                minChildren={repeaterField.view.minChildren}
              />
              <RepeatedFieldsWrapper>
                {renderRepeaterChild(child)}
              </RepeatedFieldsWrapper>
              <RightRepeaterActionControls
                addChildAfter={() => repeaterField.view.addChildAfter(index)}
                moveChildUpOne={() => repeaterField.view.moveChildUpOne(index)}
                moveChildDownOne={() =>
                  repeaterField.view.moveChildDownOne(index)
                }
                numberOfChildNodes={repeaterField.children.length}
                index={index}
              />
            </RepeaterChild>
          ))}
        </FieldLayoutVertical>
      );
    },
    wrapperComponent: AltStyleElementWrapper,
  });

export const keyTakeawaysElement = createReactAltStylesElementSpec(
  keyTakeawaysFields,
  (fields) => fields.repeater,
  (repeaterChild) => (
    <>
      <FieldWrapper
        headingLabel="Key Takeaway Title"
        field={repeaterChild.title}
        useAlternateStyles={true}
      />
      <FieldWrapper
        headingLabel="Key Takeaway Content"
        field={repeaterChild.content}
        useAlternateStyles={true}
      />
    </>
  )
);
