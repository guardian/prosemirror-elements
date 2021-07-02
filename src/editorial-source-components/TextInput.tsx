import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";
import { TextInput as OriginalTextInput } from "@guardian/src-text-input";
import { inputBorder } from "./inputBorder";

export const TextInput = styled(OriginalTextInput)`
  ${inputBorder}
  height: initial;
  padding: ${space[1]}px ${space[1]}px;
  font-size: 0.9375rem;
  ${textSans.small({ lineHeight: "loose" })};
`;

TextInput.defaultProps = { hideLabel: true };
