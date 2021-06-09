import type { Node } from "prosemirror-model";
import { AttributeFieldView } from "./AttributeFieldView";

export type CheckboxFields = { value: boolean };

export class CheckboxFieldView extends AttributeFieldView<CheckboxFields> {
  public static propName = "checkbox" as const;
  public static defaultValue = { value: false };
  private checkboxElement: HTMLInputElement | undefined = undefined;

  public getNodeValue(node: Node): CheckboxFields {
    return node.attrs.fields as CheckboxFields;
  }

  protected createInnerView({ value }: CheckboxFields): void {
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
  protected updateInnerView({ value }: CheckboxFields): void {
    if (this.checkboxElement) {
      this.checkboxElement.checked = value;
    }
  }
}
