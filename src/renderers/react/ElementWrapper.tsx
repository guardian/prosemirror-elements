import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { focusHalo } from "@guardian/src-foundations/accessibility";
import { border, neutral } from "@guardian/src-foundations/palette";
import {
  SvgArrowDownStraight,
  SvgArrowUpStraight,
  SvgChevronRightDouble,
} from "@guardian/src-icons";
import type { ReactElement } from "react";
import React, { useState } from "react";
import { SvgBin } from "../../editorial-source-components/SvgBin";
import { SvgHighlightAlt } from "../../editorial-source-components/SvgHighlightAlt";
import type { CommandCreator } from "../../plugin/types/Commands";

const buttonWidth = 32;

const Container = styled("div")`
  margin: ${space[3]}px 0;
  position: relative;
`;

const Body = styled("div")`
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

const Panel = styled("div")<{ isSelected: boolean }>`
  background-color: ${({ isSelected }) =>
    isSelected ? "#b3d7fe" : neutral[97]};
  flex-grow: 1;
  overflow: hidden;
  padding: ${space[3]}px;
`;

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
      activated ? neutral[0] : neutral[86]};
    svg {
      fill: ${({ activated }) => (activated ? neutral[100] : neutral[20])};
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

const RightActions = styled(Actions)`
  right: -${buttonWidth + 1}px;
`;

const LeftActions = styled(Actions)`
  left: -${buttonWidth + 1}px;
  justify-content: space-between;
`;

type Props = {
  children?: ReactElement;
  isSelected: boolean;
} & ReturnType<CommandCreator>;

export const elementWrapperTestId = "ElementWrapper";
export const moveTopTestId = "ElementWrapper__moveTop";
export const moveBottomTestId = "ElementWrapper__moveBottom";
export const moveUpTestId = "ElementWrapper__moveUp";
export const moveDownTestId = "ElementWrapper__moveDown";
export const removeTestId = "ElementWrapper__remove";
export const selectTestId = "ElementWrapper__select";

export const ElementWrapper: React.FunctionComponent<Props> = ({
  moveUp,
  moveDown,
  moveTop,
  moveBottom,
  remove,
  select,
  isSelected,
  children,
}) => {
  const [closeClickedOnce, setCloseClickedOnce] = useState(false);

  return (
    <Container
      className="ProsemirrorElement__wrapper"
      data-cy={elementWrapperTestId}
    >
      <Body>
        <LeftActions className="actions">
          <SeriousButton
            type="button"
            data-cy={selectTestId}
            disabled={!select(false)}
            onClick={() => select(true)}
          >
            <SvgHighlightAlt />
          </SeriousButton>
          <SeriousButton
            type="button"
            activated={closeClickedOnce}
            data-cy={removeTestId}
            disabled={!remove(false)}
            onClick={() => {
              if (closeClickedOnce) remove(true);
              else {
                setCloseClickedOnce(true);
                setTimeout(() => {
                  setCloseClickedOnce(false);
                }, 5000);
              }
            }}
          >
            <SvgBin />
            {closeClickedOnce && <Tooltip>Click again to confirm</Tooltip>}
          </SeriousButton>
        </LeftActions>
        <Panel isSelected={isSelected}>{children}</Panel>
        <RightActions className="actions">
          <Button
            type="button"
            data-cy={moveTopTestId}
            disabled={!moveTop(false)}
            onClick={() => moveTop(true)}
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
            onClick={() => moveUp(true)}
            aria-label="Move element up"
          >
            <SvgArrowUpStraight />
          </Button>
          <Button
            type="button"
            data-cy={moveDownTestId}
            expanded
            disabled={!moveDown(false)}
            onClick={() => moveDown(true)}
            aria-label="Move element down"
          >
            <SvgArrowDownStraight />
          </Button>
          <Button
            type="button"
            data-cy={moveBottomTestId}
            disabled={!moveBottom(false)}
            onClick={() => moveBottom(true)}
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
      </Body>
    </Container>
  );
};
