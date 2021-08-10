import type { Node } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import { AttributeFieldView } from "./AttributeFieldView";
import type { BaseFieldSpec } from "./FieldView";

export type Option<Data> = { text: string; value: Data };
type Options<Data> = ReadonlyArray<Option<Data>>;

export interface DropdownField extends BaseFieldSpec<string> {
  type: typeof DropdownFieldView.fieldName;
  options: ReadonlyArray<Option<string>>;
}

export const createDropDownField = (
  options: Options<string>,
  defaultValue: string
): DropdownField => ({
  type: DropdownFieldView.fieldName,
  options,
  defaultValue,
});

export type DropdownFields = string;

export class DropdownFieldView extends AttributeFieldView<string> {
  private dropdownElement: HTMLSelectElement | undefined = undefined;
  public static fieldName = "dropdown" as const;
  public static defaultValue = "";

  constructor(
    // The node that this FieldView is responsible for rendering.
    node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    getPos: () => number,
    // The offset of this node relative to its parent FieldView.
    offset: number,
    defaultFields: string,
    private options: ReadonlyArray<Option<string>>
  ) {
    super(node, outerView, getPos, offset);
    this.createInnerView(node.attrs.fields || defaultFields);
  }

  protected createInnerView(chosenOption: string): void {
    this.dropdownElement = document.createElement("select");

    // Add a child option for each option in the array
    for (const option of this.options) {
      const domOption = this.optionToDOMnode(option, chosenOption);
      this.dropdownElement.appendChild(domOption);
    }

    // Add a listener that will return the state of the dropdown on change
    this.dropdownElement.addEventListener("change", (e) => {
      const dropdownNode = e.target as HTMLSelectElement;
      const domOptions = Array.from(dropdownNode.options);
      const selectedOption = domOptions.find((option) => option.selected);
      this.updateOuterEditor(
        selectedOption ? JSON.parse(selectedOption.value) : chosenOption
      );
    });

    this.fieldViewElement.appendChild(this.dropdownElement);
  }

  protected updateInnerView(chosenOption: string): void {
    if (this.dropdownElement) {
      const domOptions = Array.from(this.dropdownElement.options);
      domOptions.forEach(
        (domOption) =>
          (domOption.selected = JSON.parse(domOption.value) === chosenOption)
      );
    }
  }

  private optionToDOMnode(
    option: Option<string>,
    chosenOption: string
  ): HTMLOptionElement {
    const domOption = document.createElement("option");
    domOption.setAttribute("value", JSON.stringify(option.value));
    domOption.selected = option.value === chosenOption;
    const optionText = document.createTextNode(option.text);
    domOption.appendChild(optionText);
    return domOption;
  }
}
