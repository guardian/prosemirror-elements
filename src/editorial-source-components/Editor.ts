import styled from "@emotion/styled";
import { background, border } from "@guardian/src-foundations";
import { focusHalo } from "@guardian/src-foundations/accessibility";
import { body } from "@guardian/src-foundations/typography";
import { inputBorder } from "./inputBorder";

export const Editor = styled.div<{ hasValidationErrors: boolean }>`
  ${body.small()}
  .ProseMirrorElements__RichTextField, .ProseMirrorElements__TextField {
    background-color: ${background.primary};
    ${inputBorder}
    ${({ hasValidationErrors }) =>
      !!hasValidationErrors && `border-color: ${border.error};`}
    &:active {
      border: 1px solid ${background.inputChecked};
    }
    &:focus {
      ${focusHalo}
    }
  }
`;
