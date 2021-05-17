import type { Node } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import type { EmbedNodeView } from "./EmbedNodeView";

/**
 * A NodeView (https://prosemirror.net/docs/ref/#view.NodeView) representing a
 * node that contains fields that are updated atomically.
 */
export abstract class FieldNodeView<Fields extends unknown>
  implements EmbedNodeView<Fields> {
  public static propName: string;
  // The parent DOM element for this view. Public
  // so it can be mounted by consuming elements.
  public nodeViewElement = document.createElement("div");

  constructor(
    // The node that this NodeView is responsible for rendering.
    private node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    private outerView: EditorView,
    // Returns the current position of the parent Nodeview in the document.
    private getPos: () => number,
    // The offset of this node relative to its parent NodeView.
    private offset: number,
    defaultFields: Fields
  ) {
    this.createInnerView(node.attrs.fields || defaultFields);
  }

  public abstract getNodeValue(node: Node): Fields;

  protected abstract createInnerView(fields: Fields): void;

  protected abstract updateInnerView(fields: Fields): void;

  public update(node: Node) {
    if (!node.sameMarkup(this.node)) {
      return false;
    }

    this.updateInnerView(node.attrs as Fields);

    return true;
  }

  public destroy() {
    // Nothing to do – the DOM element is garbage collected.
  }

  /**
   * Update the outer editor with a new field state.
   */
  protected updateOuterEditor(fields: Fields) {
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
