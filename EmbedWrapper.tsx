import { h, Component, ComponentChild } from 'preact';

const EmbedWrapper = ({ name, moveUp, moveDown, remove, children }: {
  name: string,
  moveUp?: () => {},
  moveDown?: () => {},
  remove?: () => {},
  children?: ComponentChild[] | undefined
}) => (
  <div>
    <div>{name}</div>
    <div>{children}</div>
    <div>
      {moveUp && <button onClick={moveUp}>↑</button>}
      {moveDown && <button onClick={moveDown}>↓</button>}
      {remove && <button onClick={remove}>✕</button>}
    </div>
  </div>
);

export default EmbedWrapper;
