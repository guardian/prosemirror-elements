import { css } from "@emotion/react";
import type { ButtonProps } from "@guardian/src-button";
import { Button as SourceButton } from "@guardian/src-button";
import React from "react";

export const buttonStyles = css`
  font-family: "Guardian Agate Sans";
  line-height: normal;
  user-select: none;
`;

export const Button: React.FunctionComponent<ButtonProps> = ({
  children,
  size,
  ...props
}) => {
  return (
    <SourceButton
      size={size ? size : "xsmall"}
      cssOverrides={buttonStyles}
      {...props}
    >
      {children}
    </SourceButton>
  );
};
