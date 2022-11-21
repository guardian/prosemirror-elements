import type { Node, NodeType } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import { FieldContentType, FieldView } from "./FieldView";

/**
 * A FieldView representing a node that contains fields that are updated atomically.
 */
export abstract class AttributeFieldView<
  Value extends unknown
> extends FieldView<Value> {
  public static fieldType: string;
  public static fieldContentType = FieldContentType.ATTRIBUTES;
  // The parent DOM element for this view. Public
  // so it can be mounted by consuming elements.
  public fieldViewElement = document.createElement("div");
  private nodeType: NodeType;

  constructor(
    // The node that this FieldView is responsible for rendering.
    public node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    private outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    private getPos: () => number,
    // The offset of this node relative to its parent FieldView.
    public offset: number
  ) {
    super();
    this.nodeType = node.type;
  }

  // Classes extending AttributeFieldView should call e.g. this.createInnerView(node.attrs.fields || defaultFields)
  // in their constructor
  protected abstract createInnerView(fields: Value): void;

  protected abstract updateInnerView(fields: Value): void;

  public onUpdate(node: Node, elementOffset: number) {
    if (node.type !== this.nodeType) {
      return false;
    }

    this.offset = elementOffset;
    this.updateInnerView(node.attrs.fields as Value);

    return true;
  }

  public update(value: Value) {
    this.updateOuterEditor(value);
  }

  public destroy() {
    // Nothing to do – the DOM element is garbage collected.
  }

  /**
   * Update the outer editor with a new field state.
   */
  protected updateOuterEditor(fields: Value) {
    const outerTr = this.outerView.state.tr;
    // When we insert content, we must offset to account for a few things:
    //  - getPos() returns the position directly before the parent node (+1)
    const contentOffset = 1;
    const nodePos = this.getPos() + this.offset + contentOffset;
    outerTr.setNodeMarkup(nodePos, undefined, {
      fields,
    });

    const shouldUpdateOuter = outerTr.docChanged;

    if (shouldUpdateOuter) this.outerView.dispatch(outerTr);
  }
}
