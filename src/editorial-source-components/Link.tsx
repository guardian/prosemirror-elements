import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { textSans } from "@guardian/source-foundations";

export const linkStyles = css`
  ${textSans.small({ lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
`;

export const Link = styled.a`
  ${linkStyles}
`;
