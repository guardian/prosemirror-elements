import type { Node } from "prosemirror-model";
import { AttributeFieldView } from "./AttributeFieldView";

export type DropdownFields = Array<{
  text: string;
  value: string;
  isSelected: boolean;
}>;

export class DropdownFieldView extends AttributeFieldView<DropdownFields> {
  public static propName = "dropdown" as const;
  public static defaultValue = [];
  private dropdownElement: HTMLSelectElement | undefined = undefined;

  protected createInnerView(fields: DropdownFields): void {
    this.dropdownElement = document.createElement("select");

    // Add an option for each field
    fields.forEach((field) => {
      const thisOption = document.createElement("option");
      thisOption.setAttribute("value", field.value);
      thisOption.selected = field.isSelected;
      const optionText = document.createTextNode(field.text);
      thisOption.appendChild(optionText);
      const dropdown = this.dropdownElement as HTMLSelectElement;
      dropdown.appendChild(document.createElement("option"));
    });

    // Add a listener that will return the state of the dropdown on change
    this.dropdownElement.addEventListener("input", () => {
      if (this.dropdownElement) {
        const options = Array.from(this.dropdownElement.options);

        this.updateOuterEditor(
          options.map((option) => {
            return {
              text: option.text,
              value: option.value,
              isSelected: option.selected,
            };
          })
        );
      }
    });

    this.fieldViewElement.appendChild(this.dropdownElement);
  }

  protected updateInnerView(fields: DropdownFields): void {
    if (this.dropdownElement) {
      // Remove existing child options
      let lastChild = this.dropdownElement.lastElementChild;
      while (lastChild) {
        this.dropdownElement.removeChild(lastChild);
        lastChild = this.dropdownElement.lastElementChild;
      }
      // Add an option for each updated field
      fields.forEach((field) => {
        const thisOption = document.createElement("option");
        thisOption.setAttribute("value", field.value);
        thisOption.selected = field.isSelected;
        const optionText = document.createTextNode(field.text);
        thisOption.appendChild(optionText);
        const dropdown = this.dropdownElement as HTMLSelectElement;
        dropdown.appendChild(document.createElement("option"));
      });
    }
  }
}
