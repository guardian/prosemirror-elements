import { h, Component } from 'preact';

const EmbedWrapper = ({ name, moveUp, moveDown, remove, children }) => (
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
