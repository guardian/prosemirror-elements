import { h } from 'preact';

const EmbedWrapper = ({ name, moveUp, moveDown, remove, children }) => (
  <div>
    <div>{name}</div>
    <div>{children}</div>
    <div>
      {moveUp && (
        <button disabled={!moveUp(false)} onClick={moveUp}>
          ↑
        </button>
      )}
      {moveDown && (
        <button disabled={!moveDown(false)} onClick={moveDown}>
          ↓
        </button>
      )}
      {remove && (
        <button disabled={!remove(false)} onClick={remove}>
          ✕
        </button>
      )}
    </div>
  </div>
);

export default EmbedWrapper;
