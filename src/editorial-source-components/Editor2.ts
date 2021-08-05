import styled from "@emotion/styled";
import { background, border } from "@guardian/src-foundations";
import { focusHalo } from "@guardian/src-foundations/accessibility";
import { body } from "@guardian/src-foundations/typography";
import { inputBorder } from "./inputBorder";

export const Editor = styled.div<{ hasErrors: boolean }>`
  ${body.small()}
  .ProseMirror {
    background-color: ${background.primary};
    ${inputBorder}
    ${({ hasErrors }) => !!hasErrors && `border-color: ${border.error};`}
    &:active {
      border: 1px solid ${background.inputChecked};
    }
    &:focus {
      ${focusHalo}
    }
  }
`;
