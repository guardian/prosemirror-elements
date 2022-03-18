import styled from "@emotion/styled";
import { Column, Columns } from "@guardian/src-layout";
import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { InputHeading } from "../../editorial-source-components/InputHeading";
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
  html: string;
  originalUrl: string;
}> = ({ height, width, html, originalUrl }) => (
  <div>
    <InputHeading
      headingLabel="Preview"
      headingContent={
        <span>
          &nbsp;<Link href={originalUrl}>(original url ↪)</Link>
        </span>
      }
    />
    <IframeAspectRatioBox containerHeight={height} containerWidth={width}>
      <IframeAspectRatioBoxContents>
        <IframeFullFrameWrapper
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      </IframeAspectRatioBoxContents>
    </IframeAspectRatioBox>
  </div>
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
          <IframeAspectRatioContainer
            height={fieldValues.height}
            width={fieldValues.width}
            html={fieldValues.html}
            originalUrl={fieldValues.originalUrl}
          />
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

export const StandardFormLargePreview: React.FunctionComponent<Props> = ({
  errors,
  fields,
  fieldValues,
  checkThirdPartyTracking,
}) => (
  <div>
    <FieldLayoutVertical>
      {/* A fixed width and height gives us a fixed aspect ratio */}
      <IframeAspectRatioContainer
        height="150"
        width="300"
        html={fieldValues.html}
        originalUrl={fieldValues.originalUrl}
      />
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
