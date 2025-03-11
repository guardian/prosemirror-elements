import type { Node } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import { RepeaterFieldMapIDKey } from "../helpers/constants";
import { getRepeaterID } from "../helpers/util";
import type { FieldDescriptions } from "../types/Element";
import type { BaseFieldDescription } from "./FieldView";
import { FieldContentType, FieldView } from "./FieldView";

export const repeaterFieldType = "repeater" as const;

export const getRepeaterChildNodeName = (nodeName: string) =>
  `${nodeName}__child`;
export const getRepeaterParentNodeName = (nodeName: string) =>
  `${nodeName}__parent`;
export const getRepeaterChildNameFromParent = (nodeName: string) =>
  nodeName.replace("__parent", "__child");

export const isRepeaterParentAttribute = "isRepeaterParent"
export const isRepeaterChildAttribute = "isRepeaterParent"

export const isRepeaterField = (node: Node): boolean =>
  node.attrs?.[isRepeaterParentAttribute] === true
  || node.attrs?.[isRepeaterChildAttribute] === true

export const createRepeaterField = <FDesc extends FieldDescriptions<string>>(
  fields: FDesc,
  minChildren = 0
) => ({
  type: repeaterFieldType,
  fields,
  minChildren,
});

export interface RepeaterFieldDescription<
  FDesc extends FieldDescriptions<string>
> extends BaseFieldDescription<unknown> {
  type: typeof repeaterFieldType;
  fields: FDesc;
  minChildren: number;
}

/**
 * A FieldView representing a node that contains user-defined child nodes.
 */
export class RepeaterFieldView extends FieldView<unknown> {
  public static fieldType = repeaterFieldType;
  public static fieldContentType = FieldContentType.REPEATER;
  public static defaultValue = [];
  public fieldViewElement?: undefined;

  public constructor(
    public node: Node,
    public offset: number,
    public getPos: () => number,
    // The outer editor instance. Updated from within this class when nodes are added or removed.
    private outerView: EditorView,
    private fieldName: string,
    public minChildren: number
  ) {
    super();
  }

  /**
   * Called when the fieldView is updated from the parent editor.
   */
  public onUpdate(node: Node, offset: number): boolean {
    this.node = node;
    this.offset = offset;

    return true;
  }

  public update() {
    console.log("To be implemented: update");
  }

  public destroy() {
    console.log("To be implemented: destroy");
  }

  // When we add a node, we must add an offset:
  //  - getPos() returns the position directly before the parent node (+1)
  //  - the node we will be altering is a child of its parent (+1)
  private contentOffset = 2;

  private getStartOfChildNode(
    parentNode: Node,
    index: number,
    position: number,
    offset: number
  ) {
    let startOfChildNode = position + this.contentOffset + offset;
    parentNode.forEach((childNode, offset) => {
      if (childNode === parentNode.child(index)) {
        startOfChildNode = startOfChildNode + offset;
      }
    });
    return startOfChildNode;
  }

  /**
   * Add a new child from this repeater at the given index.
   * If list is empty, you will need to pass -1.
   */
  public addChildAfter(index: number) {
    if (index < -1 || index > this.node.childCount - 1) {
      console.error(
        `Cannot add at index ${index}: index out of range. Minimum -1, Maximum ${
          this.node.childCount - 1
        }`
      );
      return;
    }
    const tr = this.outerView.state.tr;
    const repeaterChildNodeName = getRepeaterChildNameFromParent(
      this.node.type.name
    );
    const newNode = this.node.type.schema.nodes[
      repeaterChildNodeName
    ].createAndFill({ [RepeaterFieldMapIDKey]: getRepeaterID() });
    if (!newNode) {
      console.warn(
        `[prosemirror-elements]: Could not create new repeater node of type ${this.fieldName}: createAndFill did not return a node`
      );
      return;
    }
    if (index === -1) {
      // If index is -1, add to beginning of repeater node
      const positionToAddFrom =
        this.getPos() + this.contentOffset + this.offset;
      tr.insert(positionToAddFrom, newNode);
    } else {
      // If index supplied, add after child at given index
      const nodeToAddFrom = this.node.child(index);
      const startOfNodeToAddFrom = this.getStartOfChildNode(
        this.node,
        index,
        this.getPos(),
        this.offset
      );
      const positionToAddFrom = startOfNodeToAddFrom + nodeToAddFrom.nodeSize;
      tr.insert(positionToAddFrom, newNode);
    }
    this.outerView.dispatch(tr);
  }

  public addChildAtEnd() {
    this.addChildAfter(this.node.childCount - 1);
  }

  /**
   * Remove a child from this repeater at the given index.
   * Do not remove if we are at the minimum threshold for number of children.
   */
  public removeChildAt(index: number) {
    if (index < 0 || index > this.node.childCount - 1) {
      console.error(
        `Cannot remove at index ${index}: index out of range. Minimum 0, Maximum ${
          this.node.childCount - 1
        }`
      );
      return;
    }
    if (this.node.childCount === this.minChildren) {
      return;
    }
    const tr = this.outerView.state.tr;
    const nodeToRemove = this.node.child(index);
    const startOfNodeToRemove = this.getStartOfChildNode(
      this.node,
      index,
      this.getPos(),
      this.offset
    );
    const endOfNodeToRemove = startOfNodeToRemove + nodeToRemove.nodeSize;
    tr.deleteRange(startOfNodeToRemove, endOfNodeToRemove);
    this.outerView.dispatch(tr);
  }

  /**
   * Move the child at the given index up one.
   */
  public moveChildUpOne(index: number) {
    if (index < 1 || index > this.node.childCount - 1) {
      console.error(
        `Cannot move index ${index} up: index out of range. Minimum 1, Maximum ${
          this.node.childCount - 1
        }`
      );
      return;
    }

    const tr = this.outerView.state.tr;
    const nodeToMove = this.node.child(index);
    const startOfNodeToMove = this.getStartOfChildNode(
      this.node,
      index,
      this.getPos(),
      this.offset
    );
    const endOfNodeToMove = startOfNodeToMove + nodeToMove.nodeSize;
    const previousNode = this.node.child(index - 1);
    tr.deleteRange(startOfNodeToMove, endOfNodeToMove);
    tr.insert(startOfNodeToMove - previousNode.nodeSize, nodeToMove);
    this.outerView.dispatch(tr);
  }

  /**
   * Move the child at the given index down one.
   */
  public moveChildDownOne(index: number) {
    if (index < 0 || index > this.node.childCount - 2) {
      console.error(
        `Cannot move index ${index} down: index out of range. Minimum 0, Maximum ${
          this.node.childCount - 2
        }`
      );
      return;
    }

    const tr = this.outerView.state.tr;
    const nodeToMove = this.node.child(index);
    const startOfNodeToMove = this.getStartOfChildNode(
      this.node,
      index,
      this.getPos(),
      this.offset
    );
    const endOfNodeToMove = startOfNodeToMove + nodeToMove.nodeSize;
    const nextNode = this.node.child(index + 1);
    tr.insert(endOfNodeToMove + nextNode.nodeSize, nodeToMove);
    tr.deleteRange(startOfNodeToMove, endOfNodeToMove);
    this.outerView.dispatch(tr);
  }
}
