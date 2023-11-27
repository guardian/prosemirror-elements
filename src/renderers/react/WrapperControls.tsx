import styled from "@emotion/styled";
import { border, neutral, space } from "@guardian/src-foundations";
import { CommandTelemetryType, SendTelemetryEvent } from "../../elements/helpers/types/TelemetryEvents";
import { SvgHighlightAlt } from "../../editorial-source-components/SvgHighlightAlt";
import { SvgBin } from "../../editorial-source-components/SvgBin";
import { useContext } from "react";
import { TelemetryContext } from "./TelemetryContext";
import { focusHalo } from "@guardian/src-foundations/accessibility";
import { SvgArrowDownStraight, SvgArrowUpStraight, SvgChevronRightDouble } from "@guardian/src-icons";
import { css } from "@emotion/react";

const buttonWidth = 32;
const removeTestId = "ElementWrapper__remove";
const selectTestId = "ElementWrapper__select";
const moveTopTestId = "ElementWrapper__moveTop";
const moveBottomTestId = "ElementWrapper__moveBottom";
const moveUpTestId = "ElementWrapper__moveUp";
const moveDownTestId = "ElementWrapper__moveDown";

const Button = styled("button")<{ expanded?: boolean }>`
  appearance: none;
  background: ${neutral[93]};
  border: none;
  border-top: 1px solid ${neutral[100]};
  color: ${neutral[100]};
  cursor: pointer;
  flex-grow: ${({ expanded }) => (expanded ? "1" : "0")};
  ${({ expanded }) => !expanded && "height: 32px;"};
  font-size: 15px;
  line-height: 1;
  padding: ${space[1]}px;
  width: ${buttonWidth}px;
  transition: background-color 0.1s;
  :focus {
    ${focusHalo}
    z-index: 1;
  }

  :first-of-type {
    border: none;
  }

  :hover {
    background: ${neutral[46]};
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
  :hover {
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

const Actions = styled("div")`
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transition: opacity 0.2s;
`;

const RightActions = styled(Actions)`
  right: -${buttonWidth + 1}px;
`;

const LeftActions = styled(Actions)`
  left: -${buttonWidth + 1}px;
  justify-content: space-between;
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
  z-index: 1;
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
    onRemove?: () => void,
    closeClickedOnce: boolean,
    setCloseClickedOnce: React.Dispatch<React.SetStateAction<boolean>>,
    sendTelemetryEvent: SendTelemetryEvent

}

export const LeftActionControls = ({
    select,
    remove,
    onRemove,
    closeClickedOnce,
    setCloseClickedOnce,
    sendTelemetryEvent
}: LeftActionProps) => {

    return (<LeftActions className="actions">
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
        <SeriousButton
            type="button"
            activated={closeClickedOnce}
            data-cy={removeTestId}
            disabled={!remove(false)}
            onClick={() => {
                if (closeClickedOnce) {
                sendTelemetryEvent?.(
                    CommandTelemetryType.PMERemoveButtonPressed
                );
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
    </LeftActions>
    )}

export type RightActionProps = {
    moveUp: (run?: boolean) => boolean | void;
    moveDown: (run?: boolean) => boolean | void;
    moveTop: (run?: boolean) => boolean | void;
    moveBottom: (run?: boolean) => boolean | void;
    sendTelemetryEvent: SendTelemetryEvent
}

export const RightActionControls = ({
    moveUp,
    moveDown,
    moveTop,
    moveBottom,
    sendTelemetryEvent
}: RightActionProps) => {

    return (
        <RightActions className="actions">
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
        </RightActions>
    )
}