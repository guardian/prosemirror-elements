import { css } from "@emotion/react";
import { SvgAlertTriangle } from "@guardian/src-icons";
import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { richlinkFields } from "./RichlinkSpec";

const warningStyle = css`
  font-family: "Guardian Agate Sans";
  font-size: 0.9375em;
  font-style: normal;
  font-weight: 400;
  line-height: 1em;
  letter-spacing: 0em;
  text-align: left;
  color: #c7291c;
  svg {
    fill: #c7291c;
    height: 1.2em;
    top: 0.25em;
    position: relative;
    left: 0.045em;
  }
`;

export const richlinkElement = createReactElementSpec(
  richlinkFields,
  ({ fields }) => (
    <FieldLayoutVertical>
      <div>
        Related:{" "}
        <a target="_blank" href={fields.url.value}>
          {fields.linkText.value}
        </a>
      </div>
      <CustomDropdownView
        field={fields.role}
        label="Weighting"
        display="inline"
      />
      {fields.draftReference.value ? (
        <div css={warningStyle}>
          <SvgAlertTriangle />
          This rich link references unpublished content. It will not appear
          until the target has been published.
        </div>
      ) : null}
    </FieldLayoutVertical>
  )
);
