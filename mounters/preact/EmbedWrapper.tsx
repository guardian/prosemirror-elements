import { h } from 'preact';

const EmbedWrapper = ({
  name,
  moveUp,
  moveDown,
  moveTop,
  moveBottom,
  remove,
  children
}) => (
  <div>
    <div>{name}</div>
    <div>{children}</div>
    <div>
      {moveTop && (
        <button disabled={!moveTop(false)} onClick={moveTop}>
          ↟
        </button>
      )}
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
      {moveBottom && (
        <button disabled={!moveBottom(false)} onClick={moveBottom}>
          ↡
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
