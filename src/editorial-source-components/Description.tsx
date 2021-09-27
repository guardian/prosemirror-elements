import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { textSans } from "@guardian/src-foundations/typography";

export const descriptionStyles = css`
  ${textSans.small({ lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  display: block;
`;

export const Description = styled.div`
  ${descriptionStyles}
`;
