import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";

export const Label = styled.label`
  ${textSans.small({ fontWeight: "bold", lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  margin-top: ${space[2]}px;
  margin-bottom: ${space[2]}px;
  display: block;
`;
