import type { Node } from "prosemirror-model";
import type { Decoration, DecorationSet } from "prosemirror-view";
import type { FieldDescriptions } from "../types/Element";
import type { BaseFieldDescription } from "./FieldView";
import { FieldType } from "./FieldView";

export const repeaterFieldName = "repeater" as const;

export const createRepeaterField = <FDesc extends FieldDescriptions<string>>(
  fields: FDesc
) => ({
  type: repeaterFieldName,
  fields,
  validators: [],
});

export interface RepeaterFieldDescription<
  FDesc extends FieldDescriptions<string>
> extends BaseFieldDescription<unknown> {
  type: typeof repeaterFieldName;
  fields: FDesc;
}

/**
 * A FieldView representing a node that contains user-defined child nodes.
 *
 * Offers methods to add, remove, and move nodes.
 */
export class RepeaterFieldView {
  public static fieldName = repeaterFieldName;
  public static fieldType = FieldType.REPEATER;

  public constructor(
    private node: Node,
    private elementOffset: number,
    private decorations: DecorationSet | Decoration[]
  ) {}

  /**
   * Called when the fieldView is updated from the parent editor.
   */
  public onUpdate(
    node: Node,
    elementOffset: number,
    decorations: DecorationSet | Decoration[]
  ): boolean {
    this.node = node;
    this.elementOffset = elementOffset;
    this.decorations = decorations;

    return true;
  }

  public addNode() {
    console.log("Add a node!");
  }

  public removeNode() {
    console.log("Remove a node!");
  }
}
