import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { focusHalo } from "@guardian/src-foundations/accessibility";
import { neutral } from "@guardian/src-foundations/palette";
import { textSans } from "@guardian/src-foundations/typography";
import {
  SvgArrowDownStraight,
  SvgArrowUpStraight,
  SvgChevronRightDouble,
  SvgCross,
} from "@guardian/src-icons";
import type { ReactElement } from "react";
import React from "react";
import type { CommandCreator } from "../../plugin/types/Commands";

const Container = styled("div")`
  margin: ${space[3]}px 0;
`;

const Header = styled("div")`
  border-bottom: 1px solid ${neutral[86]};
  padding-left: ${space[3]}px;
  margin-top: ${space[3]}px;
`;

const Title = styled("h2")`
  ${textSans.large({ fontWeight: "bold" })}
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
  padding: ${space[3]}px;
`;

const Actions = styled("div")`
  display: flex;
  flex-direction: column;
  opacity: 0;
  transition: opacity 0.2s;
`;

const Button = styled("button")`
  appearance: none;
  background: ${neutral[93]};
  border: none;
  border-top: 1px solid ${neutral[100]};
  color: ${neutral[100]};
  cursor: pointer;
  flex-grow: ${({ expanded }: { expanded?: boolean }) =>
    expanded ? "1" : "0"};
  font-size: 16px;
  line-height: 1;
  padding: ${space[1]}px;
  min-width: 32px;
  transition: background-color 0.1s;
  :focus {
    ${focusHalo}
    z-index: 1;
  }

  :first-child {
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

type Props = {
  name: string;
  children?: ReactElement;
} & ReturnType<CommandCreator>;

export const elementWrapperTestId = "ElementWrapper";
export const moveTopTestId = "ElementWrapper__moveTop";
export const moveBottomTestId = "ElementWrapper__moveBottom";
export const moveUpTestId = "ElementWrapper__moveUp";
export const moveDownTestId = "ElementWrapper__moveDown";
export const removeTestId = "ElementWrapper__remove";

export const ElementWrapper: React.FunctionComponent<Props> = ({
  name,
  moveUp,
  moveDown,
  moveTop,
  moveBottom,
  remove,
  children,
}) => (
  <Container data-cy={elementWrapperTestId}>
    <Body>
      <Panel>
        <Header>
          <Title>{name}</Title>
        </Header>
        {children}
      </Panel>
      <Actions className="actions">
        <Button
          data-cy={moveTopTestId}
          disabled={!moveTop(false)}
          onClick={() => moveTop(true)}
        >
          <div
            css={css`
              transform: rotate(270deg) translate(0, 1px);
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
              transform: rotate(90deg) translate(0, 1px);
            `}
          >
            <SvgChevronRightDouble />
          </div>
        </Button>

        <Button
          data-cy={removeTestId}
          disabled={!remove(false)}
          onClick={() => remove(true)}
        >
          <SvgCross />
        </Button>
      </Actions>
    </Body>
  </Container>
);
