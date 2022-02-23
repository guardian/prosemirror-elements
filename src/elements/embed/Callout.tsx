import { css } from "@emotion/react";
import { neutral, space, text } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";
import React, { useEffect, useState } from "react";
import { Error } from "../../editorial-source-components/Error";
import { Label } from "../../editorial-source-components/Label";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import { unescapeHtml } from "../helpers/html";
import { EmbedTestId } from "./EmbedForm";

type Props = {
  tag: string;
};

type Callout = {
  id: string;
  name: string;
  fields: TagFields;
};

type TagFields = {
  tagName: string;
  callout: string;
  description: string;
  formUrl: string;
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

const env =
  document.location.hostname.includes("local") ||
  document.location.hostname.includes("code")
    ? "CODE"
    : "PROD";

const targetingDomain =
  env === "CODE"
    ? "https://targeting.code.dev-gutools.co.uk"
    : "https://targeting.gutools.co.uk";

const getCampaigns = () => {
  let campaigns: Promise<Callout[]> | undefined = undefined;
  return () => {
    if (campaigns === undefined) {
      campaigns = fetch(`${targetingDomain}/api/campaigns`).then((response) =>
        response.json()
      );
    }
    return campaigns;
  };
};

const memoisedGetCampaigns = getCampaigns();

const getCalloutByTag = (tag: string) =>
  memoisedGetCampaigns().then((data: Callout[]) => {
    return data.find((callout) => callout.fields.tagName === tag);
  });

const CalloutTable = ({ calloutData }: { calloutData: Callout }) => {
  return (
    <div>
      <a
        css={css`
          display: inline-block;
          margin-bottom: ${space[2]}px;
        `}
        href={`${targetingDomain}/campaigns/${calloutData.id}`}
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
                __html: unescapeHtml(calloutData.fields.description),
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

const CalloutError = ({ tag }: { tag: string | undefined }) => {
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
          Check that the callout exists in{" "}
          <a href={targetingDomain}>Targeting</a>
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

export const Callout: React.FunctionComponent<Props> = ({ tag }) => {
  const [callout, setCallout] = useState<Callout | undefined>(undefined);

  useEffect(() => {
    getCalloutByTag(tag)
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
          <CalloutTable calloutData={callout} />
        ) : (
          <CalloutError tag={tag} />
        )}
      </div>
    </FieldLayoutVertical>
  );
};
