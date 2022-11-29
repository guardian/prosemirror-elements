import { css } from "@emotion/react";
import { neutral, space } from "@guardian/src-foundations";
import { Label } from "../../editorial-source-components/Label";
import type { CustomField } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import type { Campaign } from "./Callout";

const containerStyle = css`
  display: flex;
  flex-direction: column;
`;

const headerStyle = css`
  display: flex;
  justify-content: space-between;
`;

const tagStyle = css`
  background-color: ${neutral[93]};
  display: flex;
  align-items: center;
  margin: ${space[4]}px 0;
`;

const cellStyle = css`
  border-right: 1px solid ${neutral[100]};
  padding: 3px 5px;

  &:first-of-type {
    padding-left: ${space[3]}px;
  }

  &:last-child {
    border-right: 0;
  }
`;

const tagTypeStyle = css`
  background-color: ${neutral[100]};
  padding: 2px 6px;
  width: fit-content;
  font-size: 12px;
  font-weight: 700;
`;

const tagNameStyle = css`
  width: 50%;
`;

const bodyStyle = css`
  display: flex;
  flex-direction: column;
  margin-bottom: ${space[9]}px;
  row-gap: ${space[2]}px;
`;

const strongStyle = css`
  font-weight: 700;
`;

export const CalloutTableHeader = ({
  title,
  tagName,
  targetingUrl,
  calloutId,
  formUrl,
}: {
  title: string;
  tagName: string;
  targetingUrl: string;
  calloutId: string;
  formUrl: string;
}) => {
  return (
    <>
      <div css={headerStyle}>
        <Label>CALLOUT: {title}</Label>
        <span>
          <a
            css={css`
              margin-right: ${space[4]}px;
            `}
            href={`${targetingUrl}/campaigns/${calloutId}`}
          >
            Open in targeting tool
          </a>
          <a href={formUrl}>Open in Formstack</a>
        </span>
      </div>

      <div css={tagStyle}>
        <span css={cellStyle}>
          <p css={tagTypeStyle}>CAMPAIGN</p>
        </span>
        <span css={[cellStyle, tagNameStyle]}>{tagName}</span>
      </div>
    </>
  );
};
export const CalloutTable = ({
  calloutData,
  targetingUrl,
  isNonCollapsible,
}: {
  calloutData: Campaign;
  targetingUrl: string;
  isNonCollapsible: CustomField<boolean, boolean>;
}) => {
  const { tagName, callout, description, formUrl } = calloutData.fields;
  return (
    <div css={containerStyle}>
      <CalloutTableHeader
        title={callout}
        tagName={tagName}
        formUrl={formUrl ?? ""}
        targetingUrl={targetingUrl}
        calloutId={calloutData.id}
      />
      <div css={bodyStyle}>
        <span>
          <span css={strongStyle}>Callout title: </span>
          {callout}
        </span>
        <span>
          <span css={strongStyle}>Callout description:</span>
          <br></br>
          <div
            dangerouslySetInnerHTML={{
              __html: description ?? "",
            }}
          ></div>
        </span>
      </div>
      <CustomCheckboxView
        field={isNonCollapsible}
        label="Show as non-collapsable"
      />
    </div>
  );
};
