import type { Node, NodeType } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import type { FieldView } from "./FieldView";
import { FieldType } from "./FieldView";

/**
 * A FieldView representing a node that contains fields that are updated atomically.
 */
export abstract class AttributeFieldView<Fields extends unknown>
  implements FieldView<Fields> {
  public static propName: string;
  public static fieldType = FieldType.ATTRIBUTES;
  // The parent DOM element for this view. Public
  // so it can be mounted by consuming elements.
  public fieldViewElement = document.createElement("div");
  private nodeType: NodeType;

  constructor(
    // The node that this FieldView is responsible for rendering.
    node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    private outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    private getPos: () => number,
    // The offset of this node relative to its parent FieldView.
    private offset: number,
    defaultFields: Fields
  ) {
    this.nodeType = node.type;
    this.createInnerView(node.attrs.fields || defaultFields);
  }

  public getNodeValue(node: Node): Fields {
    return node.attrs.fields as Fields;
  }

  public getNodeFromValue(fields: Fields): Node {
    return this.nodeType.create({ fields });
  }

  protected abstract createInnerView(fields: Fields): void;

  protected abstract updateInnerView(fields: Fields): void;

  public update(node: Node, elementOffset: number) {
    if (node.type !== this.nodeType) {
      return false;
    }

    this.offset = elementOffset;
    this.updateInnerView(node.attrs.fields as Fields);

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
