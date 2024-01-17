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

export const createRepeaterField = <FDesc extends FieldDescriptions<string>>(
  fields: FDesc
) => ({
  type: repeaterFieldType,
  fields,
});

export interface RepeaterFieldDescription<
  FDesc extends FieldDescriptions<string>
> extends BaseFieldDescription<unknown> {
  type: typeof repeaterFieldType;
  fields: FDesc;
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
    private fieldName: string
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

  private getStartOfChildNode(
    parentNode: Node,
    index: number,
    position: number,
    offset: number
  ) {
    // When we add a node, we must add an offset:
    //  - getPos() returns the position directly before the parent node (+1)
    //  - the node we will be altering is a child of its parent (+1)
    const contentOffset = 2;
    let startOfChildNode = position + contentOffset + offset;
    parentNode.forEach((childNode, offset) => {
      if (childNode === parentNode.child(index)) {
        startOfChildNode = startOfChildNode + offset;
      }
    });
    return startOfChildNode;
  }

  /**
   * Add a new child from this repeater at the given index.
   * If no index is supplied, add to the end of the repeater.
   */
  public add(index?: number) {
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
    let positionToAddFrom;
    if (index === undefined) {
      // If no index, add to end of repeater node
      positionToAddFrom = this.getPos() + this.offset + this.node.nodeSize;
    } else {
      const nodeToAddFrom = this.node.child(index);
      // If index supplied, add from child at given index
      const startOfNodeToAddFrom = this.getStartOfChildNode(
        this.node,
        index,
        this.getPos(),
        this.offset
      );
      positionToAddFrom = startOfNodeToAddFrom + nodeToAddFrom.nodeSize;
    }
    tr.insert(positionToAddFrom, newNode);
    this.outerView.dispatch(tr);
  }

  /**
   * Remove a child from this repeater at the given index.
   */
  public remove(index: number) {
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
}
