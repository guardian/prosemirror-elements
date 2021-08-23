import { CustomDropdown } from "../../../editorial-source-components/CustomDropdown";
import { InputGroup } from "../../../editorial-source-components/InputGroup";
import type { Option } from "../../../plugin/fieldViews/DropdownFieldView";
import type { CustomField } from "../../../plugin/types/Element";
import { getFieldViewTestId } from "../FieldView";
import { useCustomFieldState } from "../useCustomFieldViewState";

type CustomDropdownViewProps = {
  field: CustomField<string, Array<Option<string>>>;
  errors?: string[];
  label: string;
};

export const CustomDropdownView = ({
  field,
  errors = [],
  label,
}: CustomDropdownViewProps) => {
  const [selectedElement, setSelectedElement] = useCustomFieldState(field);
  return (
    <InputGroup>
      <CustomDropdown
        options={field.description.props}
        selected={selectedElement}
        label={label}
        onChange={(event) => {
          setSelectedElement(event.target.value);
        }}
        error={errors.join(", ")}
        dataCy={getFieldViewTestId(field.name)}
      />
    </InputGroup>
  );
};
