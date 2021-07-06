import type { Node } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import { CustomFieldView } from "./CustomFieldView";
import { FieldType } from "./FieldView";

/**
 * A FieldView representing a
 * node that contains arbitrary fields that are updated atomically.
 *
 * Instead of rendering into a DOM node that's mounted by the consumer, this FieldView
 * instead provides a `subscribe` method that allows consuming code to listen for
 * state changes. In this way, consuming code can manage state and UI changes itself,
 * perhaps in its own renderer format.
 */
export class SelectFieldView<Fields = unknown> extends CustomFieldView<Fields> {
  public static fieldName = "custom" as const;
  public static fieldType = FieldType.ATTRIBUTES;
  public static defaultValue = undefined;

  constructor(
    // The node that this FieldView is responsible for rendering.
    protected node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    protected outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    protected getPos: () => number,
    // The offset of this node relative to its parent FieldView.
    protected offset: number
  ) {
    super(node, outerView, getPos, offset);
  }
}
