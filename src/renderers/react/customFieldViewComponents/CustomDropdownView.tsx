import { CustomDropdown } from "../../../editorial-source-components/CustomDropdown";
import type { Options } from "../../../plugin/fieldViews/DropdownFieldView";
import type { CustomField } from "../../../plugin/types/Element";
import { getFieldViewTestId } from "../FieldComponent";
import { useCustomFieldState } from "../useCustomFieldViewState";

type CustomDropdownViewProps = {
  field: CustomField<string, Options>;
  options?: Options;
  label: string;
  display?: "inline" | "block";
  onChange?: (event: string) => void;
};

export const CustomDropdownView = ({
  field,
  options,
  label,
  display = "block",
  onChange,
}: CustomDropdownViewProps) => {
  const [selectedElement, setSelectedElement] = useCustomFieldState(field);
  return (
    <CustomDropdown
      display={display}
      options={options ?? field.description.props}
      selected={selectedElement}
      label={label}
      onChange={(event) => {
        if (onChange) onChange(event.target.value);
        setSelectedElement(event.target.value);
      }}
      error={field.errors.map((e) => e.error).join(", ")}
      dataCy={getFieldViewTestId(field.name)}
    />
  );
};
