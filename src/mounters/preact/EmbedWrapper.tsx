import { h, VNode } from 'preact';
import { TCommandCreator } from '../../types/Commands';

type Commands = ReturnType<TCommandCreator>;

const EmbedWrapper = ({
  name,
  moveUp,
  moveDown,
  moveTop,
  moveBottom,
  remove,
  children
}: {
  name: string,
  children?: VNode
} & ReturnType<TCommandCreator>) => (
  <div>
    <div>{name}</div>
    <div>{children}</div>
    <div>
      {moveTop && (
        <button disabled={!moveTop(false)} onClick={() => moveTop(true)}>
          ↟
        </button>
      )}
      {moveUp && (
        <button disabled={!moveUp(false)} onClick={() => moveUp(true)}>
          ↑
        </button>
      )}
      {moveDown && (
        <button disabled={!moveDown(false)} onClick={() => moveDown(true)}>
          ↓
        </button>
      )}
      {moveBottom && (
        <button disabled={!moveBottom(false)} onClick={() => moveBottom(true)}>
          ↡
        </button>
      )}
      {remove && (
        <button disabled={!remove(false)} onClick={() => remove(true)}>
          ✕
        </button>
      )}
    </div>
  </div>
);

export default EmbedWrapper;
