import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { border, neutral, space } from "@guardian/src-foundations";
import { focusHalo } from "@guardian/src-foundations/accessibility";
import {
  SvgArrowDownStraight,
  SvgArrowUpStraight,
  SvgChevronRightDouble,
} from "@guardian/src-icons";
import type { MouseEventHandler } from "react";
import React, { useState } from "react";
import { SvgBin } from "../../editorial-source-components/SvgBin";
import { SvgHighlightAlt } from "../../editorial-source-components/SvgHighlightAlt";
import { CommandTelemetryType } from "../../elements/helpers/types/TelemetryEvents";
import type { SendTelemetryEvent } from "../../elements/helpers/types/TelemetryEvents";
import { actionSpacing, buttonWidth } from "../../plugin/helpers/constants";
import type { CommandState } from "../../plugin/types/Commands";

export const removeTestId = "ElementWrapper__remove";
export const selectTestId = "ElementWrapper__select";
export const moveTopTestId = "ElementWrapper__moveTop";
export const moveBottomTestId = "ElementWrapper__moveBottom";
export const moveUpTestId = "ElementWrapper__moveUp";
export const moveDownTestId = "ElementWrapper__moveDown";

export const addChildTestId = "ElementWrapper__addChild";
export const removeChildTestId = "ElementWrapper__removeChild";

export const moveChildUpTestId = "ElementWrapper__moveChildUp";
export const moveChildDownTestId = "ElementWrapper__moveChildDown";

const Button = styled("button")<{ expanded?: boolean }>`
  appearance: none;
  background: ${neutral[93]};
  border: none;
  color: ${neutral[0]};
  cursor: pointer;
  flex-grow: ${({ expanded }) => (expanded ? "1" : "0")};
  font-size: 15px;
  line-height: 1;
  padding: ${space[1]}px;
  width: ${buttonWidth}px;
  height: ${buttonWidth}px;
  transition: background-color 0.1s;
  :focus {
    ${focusHalo};
    z-index: 11;
  }

  :first-of-type {
    border: none;
  }

  :hover {
    background: ${neutral[46]};
    color: ${neutral[100]};
    svg {
      fill: ${neutral[100]};
    }
  }

  :disabled {
    background: ${neutral[86]};
    color: ${neutral[60]};
    cursor: not-allowed;
    svg {
      fill: ${neutral[60]};
    }
  }

  svg {
    fill: ${neutral[20]};
    transition: fill 0.1s;
  }
`;

const SeriousButton = styled(Button)<{ activated?: boolean }>`
  background-color: ${({ activated }) =>
    activated ? border.error : neutral[93]};
  div {
    opacity: 0;
  }
  svg {
    fill: ${({ activated }) => (activated ? neutral[100] : neutral[20])};
  }
  :hover:not(:disabled) {
    background-color: ${({ activated }) =>
      activated ? border.error : neutral[46]};
    svg {
      fill: ${neutral[100]};
    }
    div {
      opacity: 1;
    }
  }
`;

const Tooltip = styled("div")`
  background-color: ${neutral[97]};
  color: ${neutral[0]};
  position: absolute;
  left: 0px;
  border-radius: 4px;
  line-height: 1.2rem;
  bottom: ${buttonWidth + 10}px;
  font-family: "Guardian Agate Sans";
  font-size: 15px;
  filter: drop-shadow(0 2px 4px rgb(0 0 0 / 30%));
  z-index: 11;
  width: 82px;
  padding: ${space[1]}px;
  padding-bottom: 5px;
  pointer-events: none;
  transition: opacity 0.2s;
  /* Add a point to the bottom of the tooltip */
  ::after {
    content: " ";
    position: absolute;
    top: 100%;
    left: ${buttonWidth / 2}px;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: ${neutral[97]} transparent transparent transparent;
  }
`;

type VerticalPosition = "top" | "bottom";
type HorizontalPosition = "left" | "right";

const Actions = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${actionSpacing}px;
  transition: opacity 0.2s;
`;

const SideActions = styled(Actions)<{
  horizontalPosition: HorizontalPosition;
}>`
  height: 100%;
  position: absolute;
  ${({ horizontalPosition }) => `${horizontalPosition}: -${actionSpacing}px`};
  justify-content: space-between;
`;

const VerticalActions = styled("div")<{
  verticalPosition: VerticalPosition;
}>`
  position: absolute;
  ${({ verticalPosition }) => `${verticalPosition}: 0`};
  display: flex;
  flex-direction: ${({ verticalPosition }) =>
    verticalPosition === "top" ? "column" : "column-reverse"};
  align-items: center;
  width: ${actionSpacing}px;
  height: 50%;
`;

export type LeftActionProps = {
  select: () => void;
  remove: () => void;
  onRemove?: () => void;
  closeClickedOnce: boolean;
  setCloseClickedOnce: React.Dispatch<React.SetStateAction<boolean>>;
  sendTelemetryEvent: SendTelemetryEvent;
};

export const LeftActionControls = ({
  select,
  remove,
  onRemove,
  closeClickedOnce,
  setCloseClickedOnce,
  sendTelemetryEvent,
}: LeftActionProps) => (
  <SideActions className="actions" horizontalPosition={"left"}>
    <VerticalActions verticalPosition={"top"}>
      <SeriousButton
        type="button"
        data-cy={selectTestId}
        onClick={() => {
          sendTelemetryEvent?.(CommandTelemetryType.PMESelectButtonPressed);
          select();
        }}
        aria-label="Select element"
      >
        <SvgHighlightAlt />
      </SeriousButton>
    </VerticalActions>
    <VerticalActions verticalPosition={"bottom"}>
      <SeriousButton
        type="button"
        activated={closeClickedOnce}
        data-cy={removeTestId}
        onClick={() => {
          if (closeClickedOnce) {
            sendTelemetryEvent?.(CommandTelemetryType.PMERemoveButtonPressed);
            remove();
            onRemove?.();
          } else {
            setCloseClickedOnce(true);
            setTimeout(() => {
              setCloseClickedOnce(false);
            }, 5000);
          }
        }}
        aria-label="Delete element"
      >
        <SvgBin />
        {closeClickedOnce && <Tooltip>Click again to confirm</Tooltip>}
      </SeriousButton>
    </VerticalActions>
  </SideActions>
);

export type RightActionProps = {
  moveUp: () => boolean | void;
  moveDown: () => boolean | void;
  moveTop: () => boolean | void;
  moveBottom: () => boolean | void;
  commandState: CommandState;
  sendTelemetryEvent: SendTelemetryEvent;
};

export const RightActionControls = ({
  moveUp,
  moveDown,
  moveTop,
  moveBottom,
  commandState,
  sendTelemetryEvent,
}: RightActionProps) => (
  <SideActions className="actions" horizontalPosition={"right"}>
    <VerticalActions verticalPosition={"top"}>
      <Button
        type="button"
        data-cy={moveTopTestId}
        disabled={!commandState.moveUp}
        onClick={() => {
          sendTelemetryEvent?.(CommandTelemetryType.PMEUpButtonPressed, {
            jump: true,
          });
          moveTop();
        }}
        aria-label="Move element to top"
      >
        <div
          css={css`
            transform: rotate(270deg) translate(1px, 1px);
          `}
        >
          <SvgChevronRightDouble />
        </div>
      </Button>
      <Button
        type="button"
        data-cy={moveUpTestId}
        expanded
        disabled={!commandState.moveUp}
        onClick={() => {
          sendTelemetryEvent?.(CommandTelemetryType.PMEUpButtonPressed, {
            jump: false,
          });
          moveUp();
        }}
        aria-label="Move element up"
      >
        <SvgArrowUpStraight />
      </Button>
    </VerticalActions>
    <VerticalActions verticalPosition={"bottom"}>
      <Button
        type="button"
        data-cy={moveBottomTestId}
        disabled={!commandState.moveDown}
        onClick={() => {
          sendTelemetryEvent?.(CommandTelemetryType.PMEDownButtonPressed, {
            jump: true,
          });
          moveBottom();
        }}
        aria-label="Move element to bottom"
      >
        <div
          css={css`
            transform: rotate(90deg) translate(-2px, 2px);
          `}
        >
          <SvgChevronRightDouble />
        </div>
      </Button>
      <Button
        type="button"
        data-cy={moveDownTestId}
        expanded
        disabled={!commandState.moveDown}
        onClick={() => {
          sendTelemetryEvent?.(CommandTelemetryType.PMEDownButtonPressed, {
            jump: false,
          });
          moveDown();
        }}
        aria-label="Move element down"
      >
        <SvgArrowDownStraight />
      </Button>
    </VerticalActions>
  </SideActions>
);

export type LeftRepeaterActionProps = {
  removeChildAt: MouseEventHandler<HTMLButtonElement>;
  numberOfChildNodes: number;
  minChildren: number;
};

export type RightRepeaterActionProps = {
  addChildAfter?: MouseEventHandler<HTMLButtonElement>;
  moveChildUpOne: MouseEventHandler<HTMLButtonElement>;
  moveChildDownOne: MouseEventHandler<HTMLButtonElement>;
  numberOfChildNodes: number;
  index: number;
};

export const LeftRepeaterActionControls = ({
  removeChildAt,
  numberOfChildNodes,
  minChildren,
}: LeftRepeaterActionProps) => {
  const [closeClickedOnce, setCloseClickedOnce] = useState(false);

  return (
    <SideActions className="actions" horizontalPosition={"left"}>
      <VerticalActions verticalPosition={"bottom"}>
        <SeriousButton
          type="button"
          activated={closeClickedOnce}
          data-cy={removeChildTestId}
          disabled={numberOfChildNodes === minChildren}
          onClick={(e) => {
            if (closeClickedOnce) {
              return removeChildAt(e);
            } else {
              setCloseClickedOnce(true);
              setTimeout(() => {
                setCloseClickedOnce(false);
              }, 5000);
            }
          }}
          aria-label="Remove repeater child"
        >
          <SvgBin />
          {closeClickedOnce && <Tooltip>Click again to confirm</Tooltip>}
        </SeriousButton>
      </VerticalActions>
    </SideActions>
  );
};

export const RightRepeaterActionControls = ({
  addChildAfter,
  moveChildUpOne,
  moveChildDownOne,
  numberOfChildNodes,
  index,
}: RightRepeaterActionProps) => {
  return (
    <SideActions className="actions" horizontalPosition={"right"}>
      <VerticalActions verticalPosition={"top"}>
        <Button
          type="button"
          data-cy={moveChildUpTestId}
          disabled={index <= 0}
          onClick={moveChildUpOne}
          aria-label="Move repeater child up"
        >
          <SvgArrowUpStraight />
        </Button>
        <Button
          type="button"
          data-cy={moveChildDownTestId}
          disabled={index >= numberOfChildNodes - 1}
          onClick={moveChildDownOne}
          aria-label="Move repeater child down"
        >
          <SvgArrowDownStraight />
        </Button>
      </VerticalActions>
      {addChildAfter ? (
        <VerticalActions verticalPosition={"bottom"}>
          <Button
            type="button"
            data-cy={addChildTestId}
            onClick={addChildAfter}
            aria-label="Add repeater child"
          >
            +
          </Button>
        </VerticalActions>
      ) : null}
    </SideActions>
  );
};
