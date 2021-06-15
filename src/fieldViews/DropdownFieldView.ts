import type { Node } from "prosemirror-model";
import { AttributeFieldView } from "./AttributeFieldView";

export type DropdownFields = Option[];

type Option = {
  text: string;
  value: string;
  isSelected: boolean;
};

export class DropdownFieldView extends AttributeFieldView<DropdownFields> {
  public static propName = "dropdown" as const;
  public static defaultValue = [];
  private dropdownElement: HTMLSelectElement | undefined = undefined;

  protected createInnerView(fields: DropdownFields): void {
    this.dropdownElement = document.createElement("select");

    // Add a child option for each option in the array
    const options = fields;
    for (const option of options) {
      const thisOption = this.optionToDOMnode(option);
      this.dropdownElement.appendChild(thisOption);
    }

    // Add a listener that will return the state of the dropdown on change
    this.dropdownElement.addEventListener("change", (e) => {
      const dropdown = e.target as HTMLSelectElement;

      const options = Array.from(dropdown.options);
      this.updateOuterEditor(
        options.map((option) => {
          return {
            text: option.text,
            value: option.value,
            isSelected: option.selected,
          };
        })
      );
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
      const options = fields;
      for (const option of options) {
        const thisOption = this.optionToDOMnode(option);
        this.dropdownElement.appendChild(thisOption);
      }
    }
  }

  private optionToDOMnode(option: Option): HTMLOptionElement {
    const domOption = document.createElement("option");
    domOption.setAttribute("value", option.value);
    domOption.selected = option.isSelected;
    const optionText = document.createTextNode(option.text);
    domOption.appendChild(optionText);
    return domOption;
  }
}
