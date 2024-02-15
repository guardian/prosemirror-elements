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
  border-top: 1px solid ${neutral[100]};
  color: ${neutral[0]};
  cursor: pointer;
  flex-grow: ${({ expanded }) => (expanded ? "1" : "0")};
  ${({ expanded }) => !expanded && `height: ${buttonWidth}px;`};
  font-size: 15px;
  line-height: 1;
  padding: ${space[1]}px;
  width: ${buttonWidth}px;
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

export type LeftActionProps = {
  select: (run?: boolean) => true | void;
  remove: (run?: boolean) => true | void;
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
}: LeftActionProps) => {
  return (
    <LeftActions className="actions">
      <TopActions>
        <SeriousButton
          type="button"
          data-cy={selectTestId}
          disabled={!select(false)}
          onClick={() => {
            sendTelemetryEvent?.(CommandTelemetryType.PMESelectButtonPressed);
            select(true);
          }}
          aria-label="Select element"
        >
          <SvgHighlightAlt />
        </SeriousButton>
      </TopActions>
      <BottomActions>
        <SeriousButton
          type="button"
          activated={closeClickedOnce}
          data-cy={removeTestId}
          disabled={!remove(false)}
          onClick={() => {
            if (closeClickedOnce) {
              sendTelemetryEvent?.(CommandTelemetryType.PMERemoveButtonPressed);
              remove(true);
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
      </BottomActions>
    </LeftActions>
  );
};

export type RightActionProps = {
  moveUp: (run?: boolean) => boolean | void;
  moveDown: (run?: boolean) => boolean | void;
  moveTop: (run?: boolean) => boolean | void;
  moveBottom: (run?: boolean) => boolean | void;
  sendTelemetryEvent: SendTelemetryEvent;
};

export const RightActionControls = ({
  moveUp,
  moveDown,
  moveTop,
  moveBottom,
  sendTelemetryEvent,
}: RightActionProps) => {
  return (
    <RightActions className="actions">
      <TopActions>
        <Button
          type="button"
          data-cy={moveTopTestId}
          disabled={!moveTop(false)}
          onClick={() => {
            sendTelemetryEvent?.(CommandTelemetryType.PMEUpButtonPressed, {
              jump: true,
            });
            moveTop(true);
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
          disabled={!moveUp(false)}
          onClick={() => {
            sendTelemetryEvent?.(CommandTelemetryType.PMEUpButtonPressed, {
              jump: false,
            });
            moveUp(true);
          }}
          aria-label="Move element up"
        >
          <SvgArrowUpStraight />
        </Button>
      </TopActions>
      <BottomActions>
        <Button
          type="button"
          data-cy={moveDownTestId}
          expanded
          disabled={!moveDown(false)}
          onClick={() => {
            sendTelemetryEvent?.(CommandTelemetryType.PMEDownButtonPressed, {
              jump: false,
            });
            moveDown(true);
          }}
          aria-label="Move element down"
        >
          <SvgArrowDownStraight />
        </Button>
        <Button
          type="button"
          data-cy={moveBottomTestId}
          disabled={!moveBottom(false)}
          onClick={() => {
            sendTelemetryEvent?.(CommandTelemetryType.PMEDownButtonPressed, {
              jump: true,
            });
            moveBottom(true);
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
      </BottomActions>
    </RightActions>
  );
};

export type LeftRepeaterActionProps = {
  removeChildAt: MouseEventHandler<HTMLButtonElement>;
  numberOfChildNodes: number;
  minChildren: number;
};

export type RightRepeaterActionProps = {
  addChildAfter: MouseEventHandler<HTMLButtonElement>;
  moveChildUpOne: MouseEventHandler<HTMLButtonElement>;
  moveChildDownOne: MouseEventHandler<HTMLButtonElement>;
  numberOfChildNodes: number;
  index: number;
};

const Actions = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${actionSpacing}px;
`;

const LeftActions = styled(Actions)`
  height: 100%;
  justify-content: space-between;
  position: absolute;
  left: -${actionSpacing}px;
`;

const RightActions = styled(Actions)`
  height: 100%;
  justify-content: space-between;
  position: absolute;
  right: -${actionSpacing}px;
`;

const TopActions = styled(Actions)`
  position: absolute;
  top: 0;
  height: 50%;
  justify-content: flex-start;
`;

const BottomActions = styled(Actions)`
  position: absolute;
  bottom: 0;
  height: 50%;
  justify-content: flex-end;
`;

export const LeftRepeaterActionControls = ({
  removeChildAt,
  numberOfChildNodes,
  minChildren,
}: LeftRepeaterActionProps) => {
  const [closeClickedOnce, setCloseClickedOnce] = useState(false);

  return (
    <LeftActions className="actions">
      <BottomActions>
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
      </BottomActions>
    </LeftActions>
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
    <RightActions className="actions">
      <TopActions>
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
      </TopActions>
      <BottomActions>
        <Button
          type="button"
          data-cy={addChildTestId}
          onClick={addChildAfter}
          aria-label="Add repeater child"
        >
          +
        </Button>
      </BottomActions>
    </RightActions>
  );
};
