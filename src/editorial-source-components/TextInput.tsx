import type { Theme } from "@emotion/react";
import type { StyledComponent } from "@emotion/styled";
import styled from "@emotion/styled";
import type { SerializedStyles } from "@emotion/utils";
import { space } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";
import type { Props } from "@guardian/src-helpers";
import type { Width } from "@guardian/src-text-input";
import { TextInput as OriginalTextInput } from "@guardian/src-text-input";
import type { InputHTMLAttributes } from "react";
import { inputBorder } from "./inputBorder";

// Because this interface is not exported by Source, we must define
// it ourselves to be able to generate Typescript definitions for this file.
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement>, Props {
  id?: string;
  label: string;
  optional?: boolean;
  hideLabel?: boolean;
  supporting?: string;
  width?: Width;
  error?: string;
  success?: string;
  cssOverrides?: SerializedStyles | SerializedStyles[];
}

export const TextInput: StyledComponent<
  TextInputProps & {
    theme?: Theme | undefined;
  }
> = styled(OriginalTextInput)`
  ${inputBorder}
  height: initial;
  padding: ${space[1]}px ${space[1]}px;
  font-size: 0.9375rem;
  ${textSans.small({ lineHeight: "loose" })};
`;

TextInput.defaultProps = { hideLabel: true };
