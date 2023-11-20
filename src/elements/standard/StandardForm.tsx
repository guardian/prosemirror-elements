import styled from "@emotion/styled";
import { Column, Columns } from "@guardian/src-layout";
import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { InputHeading } from "../../editorial-source-components/InputHeading";
import { Link } from "../../editorial-source-components/Link";
import type { FieldNameToField } from "../../plugin/types/Element";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { TrackingStatusChecks } from "../helpers/ThirdPartyStatusChecks";
import { htmlLength } from "../helpers/validation";
import type { StandardElementOptions } from "./StandardSpec";
import { createStandardFields } from "./StandardSpec";

type Props = {
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

export const createStandardElement = ({
  createCaptionPlugins,
  checkThirdPartyTracking,
  useLargePreview,
  hasThumbnailRole,
}: StandardElementOptions) =>
  createReactElementSpec({
    fieldDescriptions: createStandardFields(
      createCaptionPlugins,
      hasThumbnailRole
    ),
    consumer: (props) => {
      const Form = useLargePreview ? StandardFormLargePreview : StandardForm;
      return (
        <Form {...props} checkThirdPartyTracking={checkThirdPartyTracking} />
      );
    },
  });

export const StandardForm: React.FunctionComponent<Props> = ({
  fields,
  checkThirdPartyTracking,
}) => (
  <div>
    <FieldLayoutVertical>
      <Columns>
        <Column width={1 / 3}>
          <IframeAspectRatioContainer
            height={fields.height.value}
            width={fields.width.value}
            html={fields.html.value}
            originalUrl={fields.originalUrl.value}
          />
        </Column>
        <Column width={2 / 3}>
          <FieldLayoutVertical>
            <FieldWrapper
              field={fields.caption}
              headingLabel="Caption"
              description={`${htmlLength(
                fields.caption.value
              )}/1000 characters`}
            />
            <CustomDropdownView
              field={fields.role}
              label="Weighting"
              display="inline"
            />
          </FieldLayoutVertical>
        </Column>
      </Columns>
      <CustomCheckboxView
        field={fields.isMandatory}
        label="This element is required for publication"
      />
      <TrackingStatusChecks
        html={fields.html.value}
        isMandatory={fields.isMandatory.value}
        checkThirdPartyTracking={checkThirdPartyTracking}
      />
    </FieldLayoutVertical>
  </div>
);

export const StandardFormLargePreview: React.FunctionComponent<Props> = ({
  fields,
  checkThirdPartyTracking,
}) => (
  <div>
    <FieldLayoutVertical>
      {/* A fixed width and height gives us a fixed aspect ratio */}
      <IframeAspectRatioContainer
        height="150"
        width="300"
        html={fields.html.value}
        originalUrl={fields.originalUrl.value}
      />
      <FieldWrapper
        field={fields.caption}
        headingLabel="Caption"
        description={`${htmlLength(fields.caption.value)}/1000 characters`}
      />
      <CustomDropdownView
        field={fields.role}
        label="Weighting"
        display="inline"
      />
      <CustomCheckboxView
        field={fields.isMandatory}
        label="This element is required for publication"
      />
      <TrackingStatusChecks
        html={fields.html.value}
        isMandatory={fields.isMandatory.value}
        checkThirdPartyTracking={checkThirdPartyTracking}
      />
    </FieldLayoutVertical>
  </div>
);
