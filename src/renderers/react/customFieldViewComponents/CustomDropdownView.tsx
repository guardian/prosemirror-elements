import { CustomDropdown } from "../../../editorial-source-components/CustomDropdown";
import type { ValidationError } from "../../../plugin/elementSpec";
import type { Options } from "../../../plugin/fieldViews/DropdownFieldView";
import type { CustomField } from "../../../plugin/types/Element";
import { getFieldViewTestId } from "../FieldView";
import { useCustomFieldState } from "../useCustomFieldViewState";

type CustomDropdownViewProps = {
  field: CustomField<string, Options>;
  options?: Options;
  errors?: ValidationError[];
  label: string;
  display?: "inline" | "block";
  changeHandler?: (id: string) => void;
};

export const CustomDropdownView = ({
  field,
  options,
  errors = [],
  label,
  display = "block",
  changeHandler,
}: CustomDropdownViewProps) => {
  const [selectedElement, setSelectedElement] = useCustomFieldState(field);
  return (
    <CustomDropdown
      display={display}
      options={options ?? field.description.props}
      selected={selectedElement}
      label={label}
      onChange={(event) => {
        setSelectedElement(event.target.value);
        if (changeHandler) changeHandler(event.target.value);
      }}
      error={errors.map((e) => e.error).join(", ")}
      dataCy={getFieldViewTestId(field.name)}
    />
  );
};
