import type { Node } from "prosemirror-model";
import type { Decoration, DecorationSet } from "prosemirror-view";
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
    private decorations: DecorationSet | Decoration[]
  ) {
    super();
  }

  /**
   * Called when the fieldView is updated from the parent editor.
   */
  public onUpdate(
    node: Node,
    offset: number,
    decorations: DecorationSet | Decoration[]
  ): boolean {
    this.node = node;
    this.offset = offset;
    this.decorations = decorations;

    return true;
  }

  public update() {
    console.log("To be implemented: update");
  }

  public destroy() {
    console.log("To be implemented: destroy");
  }
}
