import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { space, text } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";

export const errorStyles = css`
  ${textSans.small({ lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  margin-top: ${space[2]}px;
  margin-bottom: ${space[2]}px;
  display: block;
  margin-left: auto;
  color: ${text.error};
`;

export const Error = styled.div`
  ${errorStyles}
`;
