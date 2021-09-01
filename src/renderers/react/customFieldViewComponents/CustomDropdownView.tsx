import { CustomDropdown } from "../../../editorial-source-components/CustomDropdown";
import { InputGroup } from "../../../editorial-source-components/InputGroup";
import type {
  DropdownValue,
  Options,
} from "../../../plugin/fieldViews/DropdownFieldView";
import type { CustomField } from "../../../plugin/types/Element";
import { getFieldViewTestId } from "../FieldView";
import { useCustomFieldState } from "../useCustomFieldViewState";

type CustomDropdownViewProps = {
  field: CustomField<DropdownValue, Options<DropdownValue>>;
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
        onChange={(value) => {
          setSelectedElement(value);
        }}
        error={errors.join(", ")}
        dataCy={getFieldViewTestId(field.name)}
      />
    </InputGroup>
  );
};
