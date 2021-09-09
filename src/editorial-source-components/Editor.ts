import styled from "@emotion/styled";
import { background } from "@guardian/src-foundations";
import { focusHalo } from "@guardian/src-foundations/accessibility";
import { body } from "@guardian/src-foundations/typography";
import { inputBorder } from "./inputBorder";

export const Editor = styled.div`
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
