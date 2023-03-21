import styled from "@emotion/styled";

export const Heading = styled.div<{ headingDirection: "row" | "column" }>`
  display: inline-flex;
  flex-grow: 1;
  flex-direction: ${({ headingDirection }) => `${headingDirection}`};
`;
