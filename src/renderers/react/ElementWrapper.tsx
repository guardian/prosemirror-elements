import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { neutral } from "@guardian/src-foundations/palette";
import type { ReactElement } from "react";
import React, { useContext, useState } from "react";
import type { CommandCreator } from "../../plugin/types/Commands";
import { LeftActionControls, RightActionControls } from "./WrapperControls";
import { TelemetryContext } from "./TelemetryContext";

const Container = styled("div")`
  margin: ${space[3]}px 0;
  position: relative;
`;

export const Body = styled("div")`
  display: flex;
  :hover {
    .actions {
      opacity: 1;
    }
  }
  :focus-within {
    .actions {
      opacity: 1;
    }
  }
  min-height: 134px;
`;

const Panel = styled("div")<{
  isSelected: boolean;
}>`
  background-color: ${neutral[97]};
  padding: ${space[3]}px;
  flex-grow: 1;
  overflow: hidden;
  padding: ${space[3]}px;

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

export const Overlay = styled("div")`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 15;
  pointer-events: none;
  mix-blend-mode: multiply;
  background-color: #b3d7fe82;
`;

export type ElementWrapperProps = {
  children?: ReactElement;
  isSelected: boolean;
  onRemove?: () => void;
} & ReturnType<CommandCreator>;

export const elementWrapperTestId = "ElementWrapper";

export const ElementWrapper: React.FunctionComponent<ElementWrapperProps> = ({
  moveUp,
  moveDown,
  moveTop,
  moveBottom,
  remove,
  select,
  isSelected,
  onRemove,
  children,
}) => {
  const [closeClickedOnce, setCloseClickedOnce] = useState(false);
  const sendTelemetryEvent = useContext(TelemetryContext);

  return (
    <Container
      className="ProsemirrorElement__wrapper"
      data-cy={elementWrapperTestId}
    >
      <Body>
        <LeftActionControls 
          select={select}
          remove={remove}
          onRemove={onRemove}
          closeClickedOnce={closeClickedOnce}
          setCloseClickedOnce={setCloseClickedOnce}
          sendTelemetryEvent={sendTelemetryEvent}
        />
        <Panel isSelected={isSelected}>
          {isSelected && <Overlay />}
          {children}
        </Panel>
        <RightActionControls 
          moveTop={moveTop}
          moveUp={moveUp} 
          moveDown={moveDown}
          moveBottom={moveBottom} 
          sendTelemetryEvent={sendTelemetryEvent}
        />
      </Body>
    </Container>
  );
};
