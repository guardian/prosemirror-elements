import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import type { ReactElement } from "react";
import { useContext, useState } from "react";
import type { CommandCreator } from "../../plugin/types/Commands";
import { Body, Overlay } from "./ElementWrapper";
import { TelemetryContext } from "./TelemetryContext";
import { LeftActionControls, RightActionControls } from "./WrapperControls";

const AltStyleContainer = styled("div")`
  margin: ${space[3]}px 0;
  position: relative;
  padding-bottom: 8px;
  border-top: 1px dashed #ddd;
  border-bottom: 1px dashed #ddd;
  margin: ${space[3]}px -20px;
`;

const AltStylePanel = styled("div")<{
  isSelected: boolean;
}>`
  padding: 0px ${space[3]}px;
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

export type ElementWrapperProps = {
  children?: ReactElement;
  isSelected: boolean;
  onRemove?: () => void;
} & ReturnType<CommandCreator>;

export const elementWrapperTestId = "ElementWrapper";

export const AltStyleElementWrapper: React.FunctionComponent<ElementWrapperProps> = ({
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
    <AltStyleContainer
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
        <AltStylePanel isSelected={isSelected}>
          {isSelected && <Overlay />}
          {children}
        </AltStylePanel>
        <RightActionControls
          moveTop={moveTop}
          moveUp={moveUp}
          moveDown={moveDown}
          moveBottom={moveBottom}
          sendTelemetryEvent={sendTelemetryEvent}
        />
      </Body>
    </AltStyleContainer>
  );
};
