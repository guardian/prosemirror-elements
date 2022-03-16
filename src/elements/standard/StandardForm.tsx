import styled from "@emotion/styled";
import { Column, Columns } from "@guardian/src-layout";
import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { Link } from "../../editorial-source-components/Link";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { TrackingStatusChecks } from "../helpers/ThirdPartyStatusChecks";
import { htmlLength } from "../helpers/validation";
import type { createStandardFields } from "./StandardSpec";

type Props = {
  fieldValues: FieldNameToValueMap<ReturnType<typeof createStandardFields>>;
  errors: FieldValidationErrors;
  fields: FieldNameToField<ReturnType<typeof createStandardFields>>;
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
};

const IframeAspectRatioBox = styled.div<{
  containerHeight: string;
  containerWidth: string;
}>`
  height: 0;
  overflow: hidden;
  padding-top: ${({ containerHeight, containerWidth }) =>
    `calc(${containerHeight} / ${containerWidth}  * 100%)`};
  background: white;
  position: relative;
`;

const IframeAspectRatioBoxContents = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  iframe {
    width: 100%;
    height: 100%;
  }
`;

const IframeAspectRatioContainer: React.FunctionComponent<{
  height: string;
  width: string;
}> = ({ height, width, children }) => (
  <IframeAspectRatioBox containerHeight={height} containerWidth={width}>
    <IframeAspectRatioBoxContents>{children}</IframeAspectRatioBoxContents>
  </IframeAspectRatioBox>
);

const IframeFullFrameWrapper = styled.div`
  height: 100%;
  width: 100%;
  white-space: initial;
`;

export const StandardForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
  fieldValues,
  checkThirdPartyTracking,
}) => (
  <div>
    <FieldLayoutVertical>
      <Columns>
        <Column width={1 / 3}>
          <FieldLayoutVertical>
            <IframeAspectRatioContainer
              height={fieldValues.height}
              width={fieldValues.width}
            >
              <IframeFullFrameWrapper
                dangerouslySetInnerHTML={{
                  __html: fieldValues.html,
                }}
              />
            </IframeAspectRatioContainer>
            <Link target="_blank" rel="noopener" href={fieldValues.originalUrl}>
              Go to content ↪
            </Link>
          </FieldLayoutVertical>
        </Column>
        <Column width={2 / 3}>
          <FieldLayoutVertical>
            <FieldWrapper
              field={fields.caption}
              errors={errors.caption}
              headingLabel="Caption"
              description={`${htmlLength(fieldValues.caption)}/1000 characters`}
            />
            <CustomDropdownView
              field={fields.role}
              label="Weighting"
              errors={errors.role}
              display="inline"
            />
          </FieldLayoutVertical>
        </Column>
      </Columns>
      <CustomCheckboxView
        field={fields.isMandatory}
        errors={errors.isMandatory}
        label="This element is required for publication"
      />
      <TrackingStatusChecks
        html={fieldValues.html}
        isMandatory={fieldValues.isMandatory}
        checkThirdPartyTracking={checkThirdPartyTracking}
      />
    </FieldLayoutVertical>
  </div>
);
