import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { text } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";

export const errorStyles = css`
  ${textSans.small({ lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  text-transform: none;
  display: block;
  color: ${text.error};
  user-select: none;
`;

export const Error = styled.div<{ useAlternateStyles?: boolean }>`
  ${errorStyles}
  ${({ useAlternateStyles }) =>
    useAlternateStyles
      ? `
    ${textSans.xxsmall({ lineHeight: "loose" })};
    font-family: "Guardian Agate Sans";
  `
      : undefined}
`;
