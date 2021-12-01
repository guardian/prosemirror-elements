import { css } from "@emotion/react";
import { border, space } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";

export const message = css`
  ${textSans.small({ fontWeight: "bold", lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  display: block;
  font-weight: 300;
  margin-bottom: 0px !important;
  margin-top: 0px;
  svg {
    height: 1.2rem;
    width: 1.2rem;
    margin-bottom: -${space[1]}px;
  }
`;

export const conversionMessage = css`
  background-color: #f7ebd4;
  border: 1px solid #f0d8a8;
  padding: ${space[1]}px;
`;

export const niceColours = css`
  color: ${border.success};
  svg {
    fill: ${border.success};
  }
`;

export const warningColours = css`
  color: #ca870c;
  svg {
    fill: #ca870c;
  }
`;

export const naughtyColours = css`
  color: ${border.error};
  svg {
    fill: ${border.error};
  }
`;
