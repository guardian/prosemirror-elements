import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { focusHalo } from "@guardian/src-foundations/accessibility";
import { border, neutral } from "@guardian/src-foundations/palette";
import {
  SvgArrowDownStraight,
  SvgArrowUpStraight,
  SvgChevronRightDouble,
  SvgCross,
} from "@guardian/src-icons";
import type { ReactElement } from "react";
import React from "react";
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
`;

const Panel = styled("div")`
  background: ${neutral[97]};
  flex-grow: 1;
  overflow: hidden;
  padding-left: ${space[3]}px;
  padding-right: ${space[3]}px;
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
  font-size: 16px;
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

const SeriousButton = styled(Button)`
  :hover {
    background-color: ${border.error};
    svg {
      fill: #fff;
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
  flex-direction: column-reverse;
  left: -${buttonWidth + 1}px;
`;

type Props = {
  children?: ReactElement;
} & ReturnType<CommandCreator>;

export const elementWrapperTestId = "ElementWrapper";
export const moveTopTestId = "ElementWrapper__moveTop";
export const moveBottomTestId = "ElementWrapper__moveBottom";
export const moveUpTestId = "ElementWrapper__moveUp";
export const moveDownTestId = "ElementWrapper__moveDown";
export const removeTestId = "ElementWrapper__remove";

export const ElementWrapper: React.FunctionComponent<Props> = ({
  moveUp,
  moveDown,
  moveTop,
  moveBottom,
  remove,
  children,
}) => (
  <Container
    className="ProsemirrorElement__wrapper"
    data-cy={elementWrapperTestId}
  >
    <Body>
      <LeftActions className="actions">
        <SeriousButton
          data-cy={removeTestId}
          disabled={!remove(false)}
          onClick={() => remove(true)}
        >
          <SvgCross />
        </SeriousButton>
      </LeftActions>
      <Panel>{children}</Panel>
      <RightActions className="actions">
        <Button
          data-cy={moveTopTestId}
          disabled={!moveTop(false)}
          onClick={() => moveTop(true)}
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
          data-cy={moveUpTestId}
          expanded
          disabled={!moveUp(false)}
          onClick={() => moveUp(true)}
        >
          <SvgArrowUpStraight />
        </Button>
        <Button
          data-cy={moveDownTestId}
          expanded
          disabled={!moveDown(false)}
          onClick={() => moveDown(true)}
        >
          <SvgArrowDownStraight />
        </Button>
        <Button
          data-cy={moveBottomTestId}
          disabled={!moveBottom(false)}
          onClick={() => moveBottom(true)}
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
