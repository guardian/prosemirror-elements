import type { Node } from "prosemirror-model";
import { AttributeFieldView } from "./AttributeFieldView";

export type DropdownFields = {
  value: OptionsArray;
};

type OptionsArray = Array<{
  text: string;
  value: string;
  isSelected: boolean;
}>;

export class DropdownFieldView extends AttributeFieldView<DropdownFields> {
  public static propName = "dropdown" as const;
  public static defaultValue = { value: [] };
  private dropdownElement: HTMLSelectElement | undefined = undefined;

  protected createInnerView(fields: DropdownFields): void {
    const options = fields.value;
    this.dropdownElement = document.createElement("select");

    // Add a child option for each option in the array
    for (const option of options) {
      const thisOption = document.createElement("option");
      thisOption.setAttribute("value", option.value);
      thisOption.selected = option.isSelected;
      const optionText = document.createTextNode(option.text);
      thisOption.appendChild(optionText);
      this.dropdownElement.appendChild(thisOption);
    }

    // Add a listener that will return the state of the dropdown on change
    this.dropdownElement.addEventListener("change", (e) => {
      const dropdown = e.target as HTMLSelectElement;

      const options = Array.from(dropdown.options);
      this.updateOuterEditor({
        value: options.map((option) => {
          return {
            text: option.text,
            value: option.value,
            isSelected: option.selected,
          };
        }),
      });
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
      const options = fields.value;
      options.forEach((option) => {
        const thisOption = document.createElement("option");
        thisOption.setAttribute("value", option.value);
        thisOption.selected = option.isSelected;
        const optionText = document.createTextNode(option.text);
        thisOption.appendChild(optionText);
        const dropdown = this.dropdownElement as HTMLSelectElement;
        dropdown.appendChild(document.createElement("option"));
      });
    }
  }
}
