import { css } from "@emotion/react";
import { neutral } from "@guardian/source-foundations";

export const inputBorder = css`
  border: 1px solid ${neutral[86]};
  :active {
    border-width: 1px;
  }
`;
