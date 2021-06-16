import type { Node } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import type { Option } from "../types/Element";
import { AttributeFieldView } from "./AttributeFieldView";

export type DropdownFields = string;

export class DropdownFieldView<
  Data = unknown
> extends AttributeFieldView<Data> {
  private dropdownElement: HTMLSelectElement | undefined = undefined;
  public static propName = "dropdown" as const;
  public static defaultValue = [];

  constructor(
    // The node that this FieldView is responsible for rendering.
    node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    getPos: () => number,
    // The offset of this node relative to its parent FieldView.
    offset: number,
    defaultFields: Data,
    private options: ReadonlyArray<Option<Data>>
  ) {
    super(node, outerView, getPos, offset, defaultFields);
  }

  protected createInnerView(fields: Data): void {
    console.log(fields);
    this.dropdownElement = document.createElement("select");

    // Add a child option for each option in the array
    console.log(this.options);
    for (const option of this.options) {
      const thisOption = this.optionToDOMnode(option);
      this.dropdownElement.appendChild(thisOption);
    }

    // Add a listener that will return the state of the dropdown on change
    this.dropdownElement.addEventListener("change", (e) => {
      const dropdown = e.target as HTMLSelectElement;

      const domOptions = Array.from(dropdown.options);
      this.updateOuterEditor(
        (domOptions.find((option) => option.selected)?.value ?? fields) as Data
      );
    });

    this.fieldViewElement.appendChild(this.dropdownElement);
  }

  protected updateInnerView(fields: Data): void {
    if (this.dropdownElement) {
      // Remove existing child options
      let lastChild = this.dropdownElement.lastElementChild;
      while (lastChild) {
        this.dropdownElement.removeChild(lastChild);
        lastChild = this.dropdownElement.lastElementChild;
      }
      // Add an option for each updated field
      const options = fields;
      // for (const option of options) {
      //   const thisOption = this.optionToDOMnode(option);
      //   this.dropdownElement.appendChild(thisOption);
      // }
    }
  }

  private optionToDOMnode(option: Option<Data>): HTMLOptionElement {
    const domOption = document.createElement("option");
    // domOption.setAttribute("value", option.value);
    // domOption.selected = option.isSelected;
    const optionText = document.createTextNode(option.text);
    domOption.appendChild(optionText);
    return domOption;
  }
}
