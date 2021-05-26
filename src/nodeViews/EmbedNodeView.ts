import type { Node } from "prosemirror-model";
import type { Decoration, DecorationSet } from "prosemirror-view";

export enum FieldType {
  // Uses node attributes to store field data.
  ATTRIBUTES = "ATTRIBUTES",
  // Uses node content to store field data.
  CONTENT = "CONTENT",
}

/**
 * Represents a prosemirror-embed view of a Prosemirror Node.
 */
export abstract class EmbedNodeView<NodeValue> {
  public static propName: string;
  public static fieldType: FieldType;
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

  /**
   * Create a node for this NodeView with the given data.
   */
  public abstract getNodeFromValue(data: NodeValue): Node;
}
