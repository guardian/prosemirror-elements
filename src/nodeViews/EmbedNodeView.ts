import type { Node } from "prosemirror-model";
import type { Decoration, DecorationSet } from "prosemirror-view";

/**
 * Represents a prosemirror-embed view of a Prosemirror Node.
 */
export abstract class EmbedNodeView<NodeValue> {
  public static propName: string;
  // The HTML element this nodeView renders content into.
  public abstract nodeViewElement: HTMLElement;

  /**
   * Called when the nodeView is updated.
   */
  public abstract update(
    node: Node,
    elementOffset: number,
    decorations: DecorationSet | Decoration[]
  ): boolean;

  /**
   * Called when the nodeView is destroyed.
   */
  public abstract destroy(): void;

  /**
   * Get the value from a given node that's represented by this NodeView.
   */
  public abstract getNodeValue(node: Node): NodeValue;
}
