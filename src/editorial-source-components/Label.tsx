import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { textSans } from "@guardian/src-foundations/typography";

export const labelStyles = css`
  ${textSans.small({ fontWeight: "bold", lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  display: block;
  user-select: none;
  cursor: pointer;
`;

export const Label = styled.label<{useAlternateStyles?: boolean}>`
  ${labelStyles}
  ${({useAlternateStyles}) => useAlternateStyles ? `
    ${textSans.xxsmall({ fontWeight: "bold", lineHeight: "loose" })};
    font-family: "Guardian Agate Sans";
  ` : undefined}
`;

export const NonBoldLabel = styled(Label)`
  font-weight: normal;
`;
