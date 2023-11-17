import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { text, textSans } from "@guardian/source-foundations";

export const errorStyles = css`
  ${textSans.small({ lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  display: block;
  color: ${text.error};
  user-select: none;
`;

export const Error = styled.div`
  ${errorStyles}
`;
