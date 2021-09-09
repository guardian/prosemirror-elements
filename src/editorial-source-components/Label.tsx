import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { textSans } from "@guardian/src-foundations/typography";

export const labelStyles = css`
  ${textSans.small({ fontWeight: "bold", lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  display: block;
  // Ensure that the label pushes error messages to the rhs
  // if they occupy the same line, to ensure the error message
  // is right-aligned.
  flex-grow: 1;
`;

export const Label = styled.label`
  ${labelStyles}
`;
