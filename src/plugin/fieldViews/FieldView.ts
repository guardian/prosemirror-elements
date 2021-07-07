import type { Node } from "prosemirror-model";
import type { Decoration, DecorationSet } from "prosemirror-view";

/**
 * The specification for an element field, to be modelled as a Node in Prosemirror.
 */
export interface BaseFieldSpec<DefaultValue extends unknown> {
  // The data type of the field.
  type: string;
  defaultValue?: DefaultValue;
}

export enum FieldType {
  // Uses node attributes to store field data.
  ATTRIBUTES = "ATTRIBUTES",
  // Uses node content to store field data.
  CONTENT = "CONTENT",
}

/**
 * Represents a prosemirror-element view of a Prosemirror Node.
 */
export abstract class FieldView<NodeValue> {
  public static fieldName: string;
  public static fieldType: FieldType;
  // The HTML element this fieldView renders content into.
  public abstract fieldViewElement?: HTMLElement;

  /**
   * Called when the fieldView is updated.
   */
  public abstract update(
    node: Node,
    elementOffset: number,
    decorations: DecorationSet | Decoration[]
  ): boolean;

  /**
   * Called when the fieldView is destroyed.
   */
  public abstract destroy(): void;

  /**
   * Get the value from a given node that's represented by this fieldView.
   */
  public abstract getNodeValue(node: Node): NodeValue;

  /**
   * Create a node for this fieldView with the given data.
   */
  public abstract getNodeFromValue(data: NodeValue): Node;
}
