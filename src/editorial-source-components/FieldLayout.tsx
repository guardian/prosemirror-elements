import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";

export const FieldLayoutVertical = styled.div<{useAlternateStyles?: boolean}>`
  display: flex;
  flex-direction: column;
  ${({useAlternateStyles}) => useAlternateStyles ? undefined : `gap: ${space[3]}px;`}
`;

export const FieldLayoutHorizontal = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${space[3]}px;
`;
