import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { neutral } from "@guardian/src-foundations/palette";
import type { ReactElement } from "react";
import React, { useContext, useState } from "react";
import type { CommandCreator } from "../../plugin/types/Commands";
import { TelemetryContext } from "./TelemetryContext";
import { LeftActionControls, RightActionControls } from "./WrapperControls";

export const Container = styled("div")`
  margin: ${space[3]}px 0;
  position: relative;
`;

export const Body = styled("div")`
  display: flex;
  min-height: 134px;
  &:not(:hover) .actions,
  &:not(:focus-within) .actions,
  .ProseMirrorElements__NestedElementField &:not(:hover) .actions,
  .ProseMirrorElements__NestedElementField &:not(:focus-within) .actions {
    opacity: 0;
  }
  &:hover .actions,
  &:focus-within .actions,
  .ProseMirrorElements__NestedElementField &:hover .actions,
  .ProseMirrorElements__NestedElementField &:focus-within .actions {
    opacity: 1;
    // z-index: 11 is required to make sure the controls are on top of other ProseMirror styles
    z-index: 11;
  }
  // If nested element's controls are visible, hide parent's controls
  :has(.ProseMirrorElements__NestedElementField
      .ProseMirrorElements__Wrapper:hover) {
    .actions {
      opacity: 0;
    }
    .ProseMirrorElements__NestedElementField
      .ProseMirrorElements__Wrapper:hover
      .actions,
    .ProseMirrorElements__NestedElementField
      .ProseMirrorElements__Wrapper:focus-within
      .actions {
      opacity: 1;
      // z-index: 12 is required to make sure the nested element's controls are on top of the parent's controls
      z-index: 12;
    }
  }
`;

export const noSelectionHighlighting = `
 * {
    ::selection {
      background: transparent;
    }

    ::-moz-selection {
     background: transparent;
    }
  }
`;

const Panel = styled("div")<{
  isSelected: boolean;
}>`
  position: relative;
  background-color: ${neutral[97]};
  padding: ${space[3]}px;
  flex-grow: 1;
  overflow: hidden;
  padding: ${space[3]}px;

  ${({ isSelected }) => (isSelected ? noSelectionHighlighting : "")}
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
      className="ProseMirrorElements__Wrapper"
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
