import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { neutral, opinion } from "@guardian/src-foundations/palette";
import { textSans } from "@guardian/src-foundations/typography";
import {
  SvgArrowDownStraight,
  SvgArrowUpStraight,
  SvgChevronRightDouble,
  SvgCross,
} from "@guardian/src-icons";
import type { ReactElement } from "react";
import React from "react";
import type { CommandCreator } from "../../types/Commands";

const Container = styled("div")`
  background: ${neutral[97]};
  border-top: 1px solid ${neutral[60]};
  margin: ${space[4]} 0;
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
`;

const Panel = styled("div")`
  flex-grow: 1;
  overflow: hidden;
  padding: ${space[3]}px;
`;

const Actions = styled("div")`
  display: flex;
  flex-direction: column;
`;

const Button = styled("button")`
  appearance: none;
  background: ${opinion[500]};
  border: none;
  border-top: 1px solid ${neutral[97]};
  color: ${neutral[100]};
  cursor: pointer;
  flex-grow: ${({ expanded }: { expanded?: boolean }) =>
    expanded ? "1" : "0"};
  font-size: 16px;
  line-height: 1;
  padding: ${space[1]}px;
  min-width: ${space[6]}px;

  :first-child {
    border: none;
  }

  :hover {
    background: ${opinion[400]};
  }

  :disabled {
    background: ${neutral[93]};
    color: ${neutral[86]};
    cursor: auto;
  }

  svg {
    fill: ${neutral[100]};
  }

  :disabled svg {
    fill: ${neutral[60]};
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
    <Header>
      <Title>{name}</Title>
    </Header>
    <Body>
      <Panel>{children}</Panel>
      <Actions>
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
