import type { Node } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import type { FieldView } from "./FieldView";
import { FieldType } from "./FieldView";

type Subscriber<Fields extends unknown> = (fields: Fields) => void;

/**
 * A FieldView representing a
 * node that contains arbitrary fields that are updated atomically.
 *
 * Instead of rendering into a DOM node that's mounted by the consumer, this FieldView
 * instead provides a `subscribe` method that allows consuming code to listen for
 * state changes. In this way, consuming code can manage state and UI changes itself,
 * perhaps in its own renderer format.
 */
export class CustomFieldView<Fields = unknown> implements FieldView<Fields> {
  public static propName = "custom" as const;
  public static fieldType = FieldType.ATTRIBUTES;
  public static defaultValue = undefined;

  private subscribers: Array<Subscriber<Fields>> = [];

  constructor(
    // The node that this FieldView is responsible for rendering.
    protected node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    protected outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    protected getPos: () => number,
    // The offset of this node relative to its parent FieldView.
    protected offset: number
  ) {}

  public getNodeValue(node: Node): Fields {
    return node.attrs.fields as Fields;
  }

  public getNodeFromValue(fields: Fields): Node {
    return this.node.type.create({ fields });
  }

  /**
   * @returns A function that can be called to update the node fields.
   */
  public subscribe(subscriber: Subscriber<Fields>) {
    this.subscribers.push(subscriber);
    subscriber(this.node.attrs.fields as Fields);
    return (fields: Fields) => this.updateOuterEditor(fields);
  }

  public unsubscribe(subscriber: Subscriber<Fields>) {
    const subscriberIndex = this.subscribers.indexOf(subscriber);
    if (subscriberIndex === -1) {
      console.error(
        `[prosemirror-elements]: Attempted to unsubscribe from a CustomFieldView but couldn't find the subscriber`
      );
      return;
    }
    this.subscribers.splice(subscriberIndex, 1);
  }

  public update(node: Node, elementOffset: number) {
    if (node.type !== this.node.type) {
      return false;
    }

    this.offset = elementOffset;

    this.updateSubscribers(node.attrs.fields as Fields);

    return true;
  }

  public destroy() {
    this.subscribers = [];
  }

  private updateSubscribers(fields: Fields) {
    this.subscribers.forEach((subscriber) => {
      subscriber(fields);
    });
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
