import { css } from "@emotion/react";
import { Button as SourceButton } from "@guardian/src-button";
import type { ReactElement } from "react";
import React from "react";

export const buttonStyles = css`
  font-family: "Guardian Agate Sans";
`;

type Size = "default" | "small" | "xsmall";
type ButtonPriority = "primary" | "secondary" | "tertiary" | "subdued";
type IconSide = "left" | "right";

type Props = {
  iconSide?: IconSide;
  priority?: ButtonPriority;
  size?: Size;
  icon?: ReactElement;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const Button: React.FunctionComponent<Props> = ({
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
