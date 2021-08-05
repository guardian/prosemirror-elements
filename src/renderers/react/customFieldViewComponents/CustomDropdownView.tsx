import { CustomDropdown } from "../../../editorial-source-components/CustomDropdown";
import type { Option } from "../../../plugin/fieldViews/DropdownFieldView";
import type { CustomFieldViewSpec } from "../../../plugin/types/Element";
import { getFieldViewTestId } from "../FieldView";
import { useCustomFieldViewState } from "../useCustomFieldViewState";

type CustomDropdownViewProps = {
  fieldViewSpec: CustomFieldViewSpec<string, Array<Option<string>>>;
};

export const CustomDropdownView = ({
  fieldViewSpec,
}: CustomDropdownViewProps) => {
  const [selectedElement, setSelectFieldsRef] = useCustomFieldViewState(
    fieldViewSpec
  );
  return (
    <CustomDropdown
      options={fieldViewSpec.fieldSpec.props}
      selected={selectedElement}
      label={fieldViewSpec.name}
      onChange={(event) => {
        if (setSelectFieldsRef.current) {
          setSelectFieldsRef.current(event.target.value);
        }
      }}
      dataCy={getFieldViewTestId(fieldViewSpec.name)}
    />
  );
};
