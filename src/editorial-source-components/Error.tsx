import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { text } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";

export const errorStyles = css`
  ${textSans.small({ lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  display: block;
  color: ${text.error};
`;

export const Error = styled.div`
  ${errorStyles}
`;
