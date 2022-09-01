import type { Node } from "prosemirror-model";
import type { Decoration, DecorationSet } from "prosemirror-view";
import type { FieldDescriptions } from "../types/Element";
import type { BaseFieldDescription } from "./FieldView";
import { FieldType, FieldView } from "./FieldView";

export const repeaterFieldName = "repeater" as const;

export const createRepeaterField = <FDesc extends FieldDescriptions<string>>(
  fields: FDesc
) => ({
  type: repeaterFieldName,
  fields,
});

export interface RepeaterFieldDescription<
  FDesc extends FieldDescriptions<string>
> extends BaseFieldDescription<unknown> {
  type: typeof repeaterFieldName;
  fields: FDesc;
}

/**
 * A FieldView representing a node that contains user-defined child nodes.
 */
export class RepeaterFieldView extends FieldView<unknown> {
  public static fieldName = repeaterFieldName;
  public static fieldType = FieldType.REPEATER;
  public static defaultValue = [];
  public fieldViewElement?: undefined;

  public constructor(
    private node: Node,
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
