import { css } from "@emotion/react";
import { neutral, space } from "@guardian/src-foundations";
import { Label } from "../../editorial-source-components/Label";
import type { ValidationError } from "../../plugin/elementSpec";
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

const headerTitleStyle = css`
  display: flex;
  column-gap: ${space[2]}px;
`;
const headerLinkStyle = css`
  margin-right: ${space[4]}px;
`;

const changeStyle = css`
  all: unset;
  cursor: pointer;
  color: #007abc;
  text-decoration: underline;
`;

const tagRowStyle = css`
  background-color: ${neutral[93]};
  display: flex;
  align-items: center;
  margin: ${space[4]}px 0;
`;

const cellStyle = css`
  border-right: 1px solid ${neutral[100]};
  padding: 3px 5px;

  &:first-child {
    padding-left: ${space[3]}px;
  }

  &:last-child {
    border-right: 0;
  }
`;

const tagStyle = css`
  background-color: ${neutral[100]};
  padding: 2px 6px;
  width: fit-content;
  font-size: 12px;
  font-weight: 700;
`;

const tagNameStyle = css`
  width: 50%;
`;

const tagSectionStyle = css`
  width: 35%;
`;

const campaignTitleStyle = css`
  display: flex;
  flex-direction: column;
  margin-bottom: ${space[9]}px;
  row-gap: ${space[2]}px;
`;

const strongStyle = css`
  font-weight: 700;
`;
export const CalloutTable = ({
  calloutData,
  targetingUrl,
  resetCampaign,
  isNonCollapsable,
  isNonCollapsableError,
}: {
  calloutData: Campaign;
  targetingUrl: string;
  resetCampaign: () => void;
  isNonCollapsable: CustomField<boolean, boolean>;
  isNonCollapsableError: ValidationError[];
}) => {
  const { tagName, callout, description, formUrl } = calloutData.fields;
  return (
    <div css={containerStyle}>
      <div css={headerStyle}>
        <span css={headerTitleStyle}>
          <Label>CALLOUT: {tagName}</Label>
          <button css={changeStyle} onClick={resetCampaign}>
            Change
          </button>
        </span>
        <span>
          <a
            css={headerLinkStyle}
            href={`${targetingUrl}/campaigns/${calloutData.id}`}
          >
            Open in targeting tool
          </a>
          <a href={formUrl}>Open in Formstack</a>
        </span>
      </div>

      <div css={tagRowStyle}>
        <span css={cellStyle}>
          <p css={tagStyle}>CAMPAIGN</p>
        </span>
        <span css={[cellStyle, tagNameStyle]}>{tagName}</span>
        <span css={[cellStyle, tagSectionStyle]}>Global</span>
      </div>
      <div css={campaignTitleStyle}>
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
        field={isNonCollapsable}
        errors={isNonCollapsableError}
        label="Show as non-collapsable"
      />
    </div>
  );
};
