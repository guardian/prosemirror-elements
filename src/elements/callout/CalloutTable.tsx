import { css } from "@emotion/react";
import { neutral, space, text } from "@guardian/src-foundations";
import { useEffect } from "react";
import { Button } from "../../editorial-source-components/Button";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { Label } from "../../editorial-source-components/Label";
import type { FieldView as TFieldView } from "../../plugin/fieldViews/FieldView";
import type { CustomField, Field } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import type { Campaign } from "./CalloutTypes";

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

const descriptionStyle = css`
  div[contenteditable="true"] {
    a {
      color: ${text.anchorPrimary};
    }
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

const headerContentStyle = css`
  float: right;
  margin-left: auto;
`;
const headerButtonStyle = css`
  font-weight: normal;
  text-decoration: underline;
  font-size: 12px;
  color: ${neutral[10]};

  :first-of-type {
    margin-right: ${space[3]}px;
  }
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
  prompt,
  callout,
  description,
}: {
  calloutData: Campaign;
  targetingUrl: string;
  isNonCollapsible: CustomField<boolean, boolean>;
  prompt: Field<TFieldView<string>>;
  callout: Field<TFieldView<string>>;
  description: Field<TFieldView<string>>;
}) => {
  const {
    tagName,
    callout: initialCallout,
    formUrl,
    description: initialDescription,
  } = calloutData.fields;

  const DEFAULT_PROMPT = "Share your experience";

  useEffect(() => {
    prompt.update(DEFAULT_PROMPT);
  }, []);

  useEffect(() => {
    if (calloutData.fields.callout) {
      callout.update(calloutData.fields.callout);
    }
  }, [calloutData.fields.callout]);

  useEffect(() => {
    if (calloutData.fields.description) {
      description.update(calloutData.fields.description);
    }
  }, [calloutData.fields.description]);

  const getHeadingContent = (
    field: string,
    onClickReset: () => void,
    onClickHide: () => void
  ) => (
    <span css={headerContentStyle}>
      <Button
        priority="subdued"
        onClick={onClickReset}
        size="xsmall"
        cssOverrides={headerButtonStyle}
      >
        Use default {field}
      </Button>
      <Button
        priority="subdued"
        onClick={onClickHide}
        size="xsmall"
        cssOverrides={headerButtonStyle}
      >
        Hide {field}
      </Button>
    </span>
  );

  return (
    <div css={containerStyle}>
      <CalloutTableHeader
        title={initialCallout}
        tagName={tagName}
        formUrl={formUrl ?? ""}
        targetingUrl={targetingUrl}
        calloutId={calloutData.id}
      />
      <div css={bodyStyle}>
        <FieldWrapper
          className="callout-field"
          field={prompt}
          headingLabel="Callout Prompt"
          headingContent={getHeadingContent(
            "prompt",
            () => prompt.update(DEFAULT_PROMPT),
            () => prompt.update("")
          )}
        />
        <FieldWrapper
          field={callout}
          headingLabel="Callout Title"
          headingContent={getHeadingContent(
            "title",
            () => callout.update(initialCallout),
            () => callout.update("")
          )}
        />

        <div css={descriptionStyle}>
          <FieldWrapper
            field={description}
            headingLabel="Callout Description"
            headingContent={getHeadingContent(
              "description",
              () => description.update(initialDescription ?? ""),
              () => description.update("")
            )}
          />
        </div>
      </div>
      <CustomCheckboxView
        field={isNonCollapsible}
        label="Tick for stand alone callouts only"
      />
    </div>
  );
};
