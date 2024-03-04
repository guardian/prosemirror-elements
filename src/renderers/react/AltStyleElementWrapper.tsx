import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import type { ReactElement } from "react";
import type { CommandCreator } from "../../plugin/types/Commands";
import { Overlay } from "./ElementWrapper";

const AltStyleContainer = styled("div")`
  padding-bottom: 8px;
  border-top: 1px dashed #ddd;
  border-bottom: 1px dashed #ddd;
  margin: ${space[3]}px -10px;
`;

const AltStylePanel = styled("div")<{
  isSelected: boolean;
}>`
  position: relative;
  flex-grow: 1;

  * {
    ::selection {
      background: ${({ isSelected }) =>
        isSelected ? "transparent" : undefined};
    }

    ::-moz-selection {
      background: ${({ isSelected }) =>
        isSelected ? "transparent" : undefined};
    }
  }
`;

export type ElementWrapperProps = {
  children?: ReactElement;
  isSelected: boolean;
  onRemove?: () => void;
} & ReturnType<CommandCreator>;

export const elementWrapperTestId = "ElementWrapper";

export const AltStyleElementWrapper: React.FunctionComponent<ElementWrapperProps> = ({
  isSelected,
  children,
}) => {
  return (
    <AltStyleContainer className="wrapper" data-cy={elementWrapperTestId}>
      <AltStylePanel isSelected={isSelected}>
        {isSelected && <Overlay />}
        {children}
      </AltStylePanel>
    </AltStyleContainer>
  );
};
