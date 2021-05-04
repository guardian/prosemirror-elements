import React, { ReactElement } from 'react';
import styled from '@emotion/styled';
import { TCommandCreator } from '../../types/Commands';

const Container = styled('div')`
  background: #eee;
  border-top: 1px solid #111;
  margin: 16px 0;
`;

const Header = styled('div')`
  border-bottom: 1px solid #aaa;
  margin-left: 12px;
  padding: 12px 12px 12px 0;
`;

const Title = styled('h2')`
  font-size: 20px;
  margin: 0;
`;

const Body = styled('div')`
  display: flex;
`;

const Panel = styled('div')`
  flex-grow: 1;
  overflow: hidden;
  padding: 12px;
`;

const Actions = styled('div')`
  display: flex;
  flex-direction: column;
`;

const Button = styled('button')`
  appearance: none;
  background: #ff7f0f;
  border: none;
  border-top: 1px solid #aaa;
  color: #fff;
  cursor: pointer;
  flex-grow: ${({ expanded }: { expanded?: boolean }) =>
    expanded ? '1' : '0'};
  font-size: 16px;
  line-height: 1;
  padding: 8px;

  :first-child {
    border: none;
  }

  :hover {
    background: #db6600;
  }

  :disabled {
    background: #ccc;
    color: #aaa;
    cursor: auto;
  }
`;

const EmbedWrapper = ({
  name,
  moveUp,
  moveDown,
  moveTop,
  moveBottom,
  remove,
  children
}: {
  name: string;
  children?: ReactElement;
} & ReturnType<TCommandCreator>) => (
  <Container>
    <Header>
      <Title>{name}</Title>
    </Header>
    <Body>
      <Panel>{children}</Panel>
      <Actions>
        {moveTop && (
          <Button disabled={!moveTop(false)} onClick={() => moveTop(true)}>
            ↟
          </Button>
        )}
        {moveUp && (
          <Button
            expanded
            disabled={!moveUp(false)}
            onClick={() => moveUp(true)}
          >
            ↑
          </Button>
        )}
        {moveDown && (
          <Button
            expanded
            disabled={!moveDown(false)}
            onClick={() => moveDown(true)}
          >
            ↓
          </Button>
        )}
        {moveBottom && (
          <Button
            disabled={!moveBottom(false)}
            onClick={() => moveBottom(true)}
          >
            ↡
          </Button>
        )}
        {remove && (
          <Button disabled={!remove(false)} onClick={() => remove(true)}>
            ✕
          </Button>
        )}
      </Actions>
    </Body>
  </Container>
);

export default EmbedWrapper;
