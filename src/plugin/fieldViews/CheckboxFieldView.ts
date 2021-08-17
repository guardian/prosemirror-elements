import type { Node } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import { AttributeFieldView } from "./AttributeFieldView";
import type { BaseFieldDescription } from "./FieldView";

export type CheckboxValue = { value: boolean };

export interface CheckboxField extends BaseFieldDescription<CheckboxValue> {
  type: typeof CheckboxFieldView.fieldName;
}

export const createCheckBox = (defaultValue: boolean): CheckboxField => ({
  type: CheckboxFieldView.fieldName,
  defaultValue: { value: defaultValue },
});

export class CheckboxFieldView extends AttributeFieldView<CheckboxValue> {
  public static fieldName = "checkbox" as const;
  public static defaultValue = { value: false };
  private checkboxElement: HTMLInputElement | undefined = undefined;

  constructor(
    // The node that this FieldView is responsible for rendering.
    node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    getPos: () => number,
    // The offset of this node relative to its parent FieldView.
    offset: number,
    defaultFields: CheckboxValue
  ) {
    super(node, outerView, getPos, offset);
    this.createInnerView(node.attrs.fields || defaultFields);
  }
  public getNodeValue(node: Node): CheckboxValue {
    return node.attrs.fields as CheckboxValue;
  }

  protected createInnerView({ value }: CheckboxValue): void {
    this.checkboxElement = document.createElement("input");
    this.checkboxElement.type = "checkbox";
    this.checkboxElement.checked = value;
    this.checkboxElement.addEventListener("change", (event) =>
      this.updateOuterEditor({
        value: Boolean((event.target as HTMLInputElement).checked),
      })
    );
    this.fieldViewElement.appendChild(this.checkboxElement);
  }
  protected updateInnerView({ value }: CheckboxValue): void {
    if (this.checkboxElement) {
      this.checkboxElement.checked = value;
    }
  }
}
