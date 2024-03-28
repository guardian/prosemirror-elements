import styled from "@emotion/styled";
import { background, border } from "@guardian/src-foundations";
import { focusHalo } from "@guardian/src-foundations/accessibility";
import { body } from "@guardian/src-foundations/typography";
import { inputBorder } from "./inputBorder";

export const Editor = styled.div<{
  hasValidationErrors: boolean;
  useAlternateStyles?: boolean;
}>`
  ${({ useAlternateStyles }) => (useAlternateStyles ? null : body.small())}
  .ProseMirrorElements__RichTextField, .ProseMirrorElements__TextField {
    background-color: ${background.primary};
  }
  .ProseMirrorElements__RichTextField,
  .ProseMirrorElements__TextField,
  .ProseMirrorElements__NestedElementField {
    ${inputBorder}
    &:active {
      border: 1px solid ${background.inputChecked};
    }
    &:focus {
      ${focusHalo}
    }
    ${({ hasValidationErrors }) =>
      !!hasValidationErrors && `border-color: ${border.error};`}
  }
  .ProseMirrorElements__NestedElementField .ProseMirror-focused {
    outline: none;
  }
  .ProseMirrorElements__NestedElementField {
    padding: 8px 8px;
    &:focus-within {
      ${focusHalo};
      border: 1px solid ${background.inputChecked};
    }
  }
`;
