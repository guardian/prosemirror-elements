import { css } from "@emotion/react";
import { space, text } from "@guardian/src-foundations";
import { SvgAlertTriangle } from "@guardian/src-icons";
import { Error } from "../../editorial-source-components/Error";
import { CalloutTableHeader } from "./CalloutTable";
import type { Campaign } from "./CalloutTypes";

const marginBottom = css`
  margin-bottom: ${space[2]}px !important;
`;

const error = css`
  display: flex;
  align-items: center;
  svg {
    height: 20px;
    fill: ${text.error};
    margin-right: ${space[1]}px;
  }
  a {
    margin-left: auto;
  }
`;

export const CalloutError = ({
  callout,
  targetingUrl,
  calloutId,
  isExpired,
}: {
  callout: Campaign | undefined;
  targetingUrl: string;
  calloutId: string;
  isExpired: boolean;
}) => {
  const edToolsEmail = "editorial.tools.dev@theguardian.com";
  const centralProdEmail = "central.production@theguardian.com";

  return callout && isExpired ? (
    <>
      <Error css={[error, marginBottom]}>
        <SvgAlertTriangle />
        <p>This callout has expired and will not appear in the article.</p>
      </Error>
      <CalloutTableHeader
        name={callout.name}
        tagName={callout.fields.tagName}
        targetingUrl={targetingUrl}
        calloutId={calloutId}
        formUrl={callout.fields.formUrl ?? ""}
      />
    </>
  ) : (
    <div>
      <Error css={[error, marginBottom]}>
        <SvgAlertTriangle />
        Composer was unable to find this callout.
        <a href={`${targetingUrl}`}>Open in targeting tool</a>
      </Error>
      <p css={marginBottom}>
        It is likely that the callout has been deleted. Please check in
        the&nbsp;
        <a href={`${targetingUrl}`}>targeting tool</a> to check if this callout
        is available.
      </p>
      <p>
        If the problem persists, you may wish to contact Central Production (
        <a href={`mailto:${centralProdEmail}`}>{centralProdEmail}</a>) and the
        Editorial Tools team (
        <a href={`mailto:${edToolsEmail}`}>{edToolsEmail}</a>) for assistance.
      </p>
    </div>
  );
};
