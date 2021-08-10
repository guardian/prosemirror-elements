import { CustomDropdown } from "../../../editorial-source-components/CustomDropdown";
import { InputGroup } from "../../../editorial-source-components/InputGroup";
import type { Option } from "../../../plugin/fieldViews/DropdownFieldView";
import type { CustomFieldViewSpec } from "../../../plugin/types/Element";
import { getFieldViewTestId } from "../FieldView";
import { useCustomFieldViewState } from "../useCustomFieldViewState";

type CustomDropdownViewProps = {
  fieldViewSpec: CustomFieldViewSpec<string, Array<Option<string>>>;
  errors?: string[];
  label: string;
};

export const CustomDropdownView = ({
  fieldViewSpec,
  errors = [],
  label,
}: CustomDropdownViewProps) => {
  const [selectedElement, setSelectFieldsRef] = useCustomFieldViewState(
    fieldViewSpec
  );
  return (
    <InputGroup>
      <CustomDropdown
        options={fieldViewSpec.fieldSpec.props}
        selected={selectedElement}
        label={label}
        onChange={(event) => {
          if (setSelectFieldsRef.current) {
            setSelectFieldsRef.current(event.target.value);
          }
        }}
        error={errors.join(", ")}
        dataCy={getFieldViewTestId(fieldViewSpec.name)}
      />
    </InputGroup>
  );
};
