import { css } from "@emotion/react";
import { focusHalo } from "@guardian/src-foundations/accessibility";
import { body } from "@guardian/src-foundations/typography";
import { inputBorder } from "./inputBorder";

export const editor = css`
  ${body.small()}
  .ProseMirror {
    background-color: #fff;
    ${inputBorder}
  }
  .ProseMirror-focused {
    ${focusHalo}
  }
`;
