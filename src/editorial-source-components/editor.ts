import { css } from "@emotion/react";
import { background } from "@guardian/src-foundations";
import { focusHalo } from "@guardian/src-foundations/accessibility";
import { body } from "@guardian/src-foundations/typography";
import { inputBorder } from "./inputBorder";

export const editor = css`
  ${body.small()}
  .ProseMirror {
    background-color: ${background.primary};
    ${inputBorder}
    &:active {
      border: 1px solid ${background.inputChecked};
    }
    &:focus {
      ${focusHalo}
    }
  }
`;
