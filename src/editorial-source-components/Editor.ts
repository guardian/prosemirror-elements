import styled from "@emotion/styled";
import { background, border } from "@guardian/src-foundations";
import { focusHalo } from "@guardian/src-foundations/accessibility";
import { body } from "@guardian/src-foundations/typography";
import { inputBorder } from "./inputBorder";

export const Editor = styled.div<{
  hasValidationErrors: boolean;
  useAlternateStyles?: boolean;
}>`
  flex-grow: 1;
  ${({ useAlternateStyles }) => (useAlternateStyles ? null : body.small())}
  ${({ useAlternateStyles }) =>
    useAlternateStyles
      ? null
      : ".ProseMirrorElements__NestedElementField { margin-top: -1px; }"}
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
      !!hasValidationErrors &&
      `
        outline: 1px solid ${border.error};
        outline-offset: -1px;
      `}
  }
  .ProseMirrorElements__NestedElementField .ProseMirror-focused {
    outline: none;
  }
  .ProseMirrorElements__RichTextField,
  .ProseMirrorElements__TextField,
  .ProseMirrorElements__NestedElementField {
    &:focus-within {
      ${focusHalo};
      outline: 1px solid ${background.inputChecked};
      outline-offset: -1px;
    }
  }
  .ProseMirrorElements__NestedElementField {
    padding: 8px 8px;
  }
`;
