import { css } from "@emotion/react";
import { neutral, space, text } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";
import React, { useEffect, useState } from "react";
import { Label } from "../../editorial-source-components/Label";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { createEmbedFields } from "./EmbedSpec";

type Props = {
  fieldValues: FieldNameToValueMap<ReturnType<typeof createEmbedFields>>;
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

export const EmbedElementTestId = "EmbedElement";

const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const getCampaigns = (tag: string) => {
  return fetch("https://targeting.gutools.co.uk/api/campaigns")
    .then((response) => {
      return response.json();
    })
    .then((data: Callout[]) => {
      console.log(data);
      return data.find((datum) => datum.fields.tagName === tag);
    });
};

const extractTag = (html: string) => {
  const pattern = 'data-callout-tagname="(.*?)"';
  const tag = RegExp(pattern).exec(html);
  return tag ? tag[1] : undefined;
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
    /* table-layout: fixed; */
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
  p,
  p:first-child {
    margin-top: 0px;
    margin-bottom: 0px;
  }
`;

const targetingAnchor = css`
  display: inline-block;
  margin-bottom: ${space[2]}px;
`;

export const CalloutForm: React.FunctionComponent<Props> = ({
  fieldValues,
}) => {
  const [callout, setCallout] = useState<Callout | undefined>(undefined);
  const [campaigns, setCampaigns] = useState<Promise<Callout | undefined>>(
    new Promise((resolve) => resolve(undefined))
  );

  const tag = extractTag(fieldValues.html);

  useEffect(() => {
    if (tag) {
      setCampaigns(getCampaigns(tag));
    }
  }, []);

  campaigns
    .then((callout) => {
      if (callout) {
        setCallout(callout);
      }
    })
    .catch((e) => console.log(e));

  return (
    <FieldLayoutVertical data-cy={EmbedElementTestId}>
      <div css={calloutStyles}>
        <Label>Callout</Label>
        {callout ? (
          <div>
            <a
              css={targetingAnchor}
              href={`https://targeting.gutools.co.uk/campaigns/${callout.id}`}
            >
              View this callout on Targeting
            </a>

            <table css={calloutStyles}>
              <tbody>
                <tr>
                  <th>Tag Name</th>
                  <td>{callout.fields.tagName}</td>
                </tr>
                <tr>
                  <th>Title</th>
                  <td>{callout.fields.callout}</td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: decodeHtml(callout.fields.description),
                    }}
                  ></td>
                </tr>
                <tr>
                  <th>Form URL</th>
                  <td>
                    <a href={callout.fields.formUrl}>
                      {callout.fields.formUrl}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <p>
              A callout was not found matching tag{" "}
              <code>{extractTag(fieldValues.html)}</code>.
            </p>
            <br />
            <p>
              Try refreshing the page. If the problem persists, you may wish to:
            </p>
            <ul>
              <li>
                Check that the callout exists in{" "}
                <a href="https://targeting.gutools.co.uk/campaigns/">
                  Targeting
                </a>
              </li>
              <li>
                Contact Central Production (central.production@guardian.co.uk)
                and the Editorial Tools team (editorial.tools.dev@guardian.co.uk
                ) for assistance.
              </li>
            </ul>
          </div>
        )}
      </div>
    </FieldLayoutVertical>
  );
};
