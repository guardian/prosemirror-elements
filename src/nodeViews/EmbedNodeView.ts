import type { Node } from "prosemirror-model";
import type { Decoration, DecorationSet } from "prosemirror-view";

/**
 * Represents a prosemirror-embed view of a Prosemirror Node.
 */
export interface EmbedNodeView {
  nodeViewElement: HTMLElement;

  /**
   * Called when the nodeView is updated.
   */
  update(
    node: Node,
    elementOffset: number,
    decorations: DecorationSet | Decoration[]
  ): boolean;

  /**
   * Called when the nodeView is destroyed.
   */
  destroy(): void;
}
