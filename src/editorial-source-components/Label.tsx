import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { textSans } from "@guardian/src-foundations/typography";

export const labelStyles = css`
  ${textSans.small({ fontWeight: "bold", lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  display: block;
  user-select: none;
`;

export const Label = styled.label`
  ${labelStyles}
`;
