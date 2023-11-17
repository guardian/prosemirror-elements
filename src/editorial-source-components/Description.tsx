import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { textSans } from "@guardian/source-foundations";

export const descriptionStyles = css`
  ${textSans.small({ lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  display: block;
  user-select: none;
`;

export const Description = styled.div`
  ${descriptionStyles}
`;
