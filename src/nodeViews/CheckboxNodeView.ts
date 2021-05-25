import { FieldNodeView } from "./FieldNodeView";

type CheckboxFields = { value: boolean };

export class CheckboxNodeView extends FieldNodeView<CheckboxFields> {
  private checkboxElement: HTMLInputElement | undefined = undefined;

  protected createInnerView({ value }: CheckboxFields): void {
    this.checkboxElement = document.createElement("input");
    this.checkboxElement.type = "checkbox";
    this.checkboxElement.checked = value;
    this.checkboxElement.addEventListener("change", (event) =>
      this.updateOuterEditor({
        value: Boolean((event.target as HTMLInputElement).checked),
      })
    );
    this.nodeViewElement.appendChild(this.checkboxElement);
  }
  protected updateInnerView({ value }: CheckboxFields): void {
    if (this.checkboxElement) {
      this.checkboxElement.checked = value;
    }
  }
}
