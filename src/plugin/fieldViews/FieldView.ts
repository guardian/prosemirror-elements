import type { Node } from "prosemirror-model";
import type { Decoration, DecorationSet } from "prosemirror-view";
import type { FieldValidator } from "../elementSpec";

/**
 * The specification for an element field, to be modelled as a Node in Prosemirror.
 */
export interface BaseFieldDescription<DefaultValue extends unknown> {
  // The data type of the field.
  type: string;
  defaultValue?: DefaultValue;
  validators?: FieldValidator[];
}

export enum FieldType {
  // Uses node attributes to store field data.
  ATTRIBUTES = "ATTRIBUTES",
  // Uses node content to store field data.
  CONTENT = "CONTENT",
  // Represents a node that contains nested fields.
  REPEATER = "REPEATER",
}

/**
 * Represents a prosemirror-element view of a Prosemirror Node.
 */
export abstract class FieldView<NodeValue> {
  public static fieldName: string;
  public static fieldType: FieldType;
  // The HTML element this fieldView renders content into.
  public abstract fieldViewElement?: HTMLElement;
  public abstract offset: number;

  /**
   * Called when the fieldView is updated from the parent editor.
   */
  public abstract onUpdate(
    node: Node,
    elementOffset: number,
    decorations: DecorationSet | Decoration[]
  ): boolean;

  /**
   * Programmatically update this fieldView with the given value.
   */
  public abstract update(value: NodeValue): void;

  /**
   * Destroy this fieldView, cleaning up any resources it has instantiated.
   */
  public abstract destroy(): void;
}
