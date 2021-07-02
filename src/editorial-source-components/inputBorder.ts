import { css } from "@emotion/react";
import { neutral } from "@guardian/src-foundations/palette";

export const inputBorder = css`
  border: 1px solid ${neutral[86]};
  :active {
    border-width: 1px;
  }
`;
