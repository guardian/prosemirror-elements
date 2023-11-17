import styled from "@emotion/styled";
import {
  background,
  body,
  border,
  focusHalo,
} from "@guardian/source-foundations";
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
