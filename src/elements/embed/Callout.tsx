import { css } from "@emotion/react";
import { neutral, space, text } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";
import React, { useEffect, useState } from "react";
import { Error } from "../../editorial-source-components/Error";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { Label } from "../../editorial-source-components/Label";
import type { Campaign } from "../callout/CalloutTypes";
import { EmbedTestId } from "./EmbedForm";

type Props = {
  tag: string;
  targetingUrl: string;
};

const calloutStyles = css`
  ${textSans.small({ fontWeight: "regular", lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  a {
    color: ${text.anchorPrimary};
  }
  code {
    font-family: monospace;
    background-color: ${neutral[86]};
    border-radius: ${space[1]}px;
    padding: 1px 4px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid ${neutral[86]};
    font-size: 14px;
  }
  th,
  tr,
  td {
    border: 1px solid ${neutral[86]};
    padding: ${space[1]}px;
    line-height: 14px;
    vertical-align: top;
  }
  th {
    text-align: left;
  }
  p,
  p:first-child {
    margin-top: 0px;
    margin-bottom: 0px;
  }
  ul {
    margin-bottom: 0px;
  }
`;

const marginBottom = css`
  margin-bottom: ${space[2]}px !important;
`;

const getCampaigns = (targetingDomain: string) => {
  let campaigns: Promise<Campaign[]> | undefined = undefined;
  return () => {
    if (campaigns === undefined) {
      campaigns = fetch(`${targetingDomain}/api/campaigns`).then((response) =>
        response.json()
      );
    }
    return campaigns;
  };
};

const memoisedGetCampaigns = (targetingDomain: string) =>
  getCampaigns(targetingDomain);

const getCalloutByTag = (tag: string, targetingDomain: string) =>
  memoisedGetCampaigns(targetingDomain)().then((data: Campaign[]) => {
    return data.find((callout) => callout.fields.tagName === tag);
  });

export const CalloutTable = ({
  calloutData,
  targetingUrl,
}: {
  calloutData: Campaign;
  targetingUrl: string;
}) => {
  return (
    <div>
      <a
        css={css`
          display: inline-block;
          margin-bottom: ${space[2]}px;
        `}
        href={`${targetingUrl}/campaigns/${calloutData.id}`}
      >
        View this callout on Targeting
      </a>
      <Label>Content:</Label>
      <table css={calloutStyles}>
        <tbody>
          <tr>
            <th>Tag Name</th>
            <td>{calloutData.fields.tagName}</td>
          </tr>
          <tr>
            <th>Title</th>
            <td>{calloutData.fields.callout}</td>
          </tr>
          <tr>
            <th>Description</th>
            <td
              dangerouslySetInnerHTML={{
                __html: calloutData.fields.description ?? "",
              }}
            ></td>
          </tr>
          <tr>
            <th>Form URL</th>
            <td>
              <a href={calloutData.fields.formUrl}>
                {calloutData.fields.formUrl}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const CalloutError = ({
  tag,
  targetingUrl,
}: {
  tag: string | undefined;
  targetingUrl: string;
}) => {
  const edToolsEmail = "editorial.tools.dev@theguardian.com";
  const centralProdEmail = "central.production@theguardian.com";
  return tag ? (
    <div>
      <Error css={marginBottom}>
        Error: A callout was not found matching tag <code>{tag}</code>.
      </Error>
      <p>Try refreshing the page. If the problem persists, you may wish to:</p>
      <ul>
        <li>
          Check that the callout exists in <a href={targetingUrl}>Targeting</a>
        </li>
        <li>
          Contact Central Production (
          <a href={`mailto:${centralProdEmail}`}>{centralProdEmail}</a>) and the
          Editorial Tools team (
          <a href={`mailto:${edToolsEmail}`}>{edToolsEmail}</a>) for assistance.
        </li>
      </ul>
    </div>
  ) : (
    <div>
      <Error css={marginBottom}>
        Error: Composer was unable to extract a tag from this callout.
      </Error>
      <p css={marginBottom}>
        It is likely that the callout element is malformed. Try deleting and
        re-creating the the element.
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

export const Callout: React.FunctionComponent<Props> = ({
  tag,
  targetingUrl,
}) => {
  const [callout, setCallout] = useState<Campaign | undefined>(undefined);

  useEffect(() => {
    getCalloutByTag(tag, targetingUrl)
      .then((callout) => {
        if (callout) {
          setCallout(callout);
        }
      })
      .catch((e) => console.log(e));
    return () => setCallout(undefined);
  }, [tag]);

  return (
    <FieldLayoutVertical data-cy={EmbedTestId}>
      <div css={calloutStyles}>
        <Label>Callout</Label>
        {callout ? (
          <>
            <CalloutTable calloutData={callout} targetingUrl={targetingUrl} />
          </>
        ) : (
          <CalloutError tag={tag} targetingUrl={targetingUrl} />
        )}
      </div>
    </FieldLayoutVertical>
  );
};
