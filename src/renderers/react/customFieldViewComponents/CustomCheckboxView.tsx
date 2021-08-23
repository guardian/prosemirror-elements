import { CustomCheckbox } from "../../../editorial-source-components/CustomCheckbox";
import type { CustomField } from "../../../plugin/types/Element";
import { getFieldViewTestId } from "../FieldView";
import { useCustomFieldState } from "../useCustomFieldViewState";

type CustomCheckboxViewProps = {
  field: CustomField<boolean, boolean>;
  errors: string[];
  label: string;
};

export const CustomCheckboxView = ({
  field,
  errors,
  label,
}: CustomCheckboxViewProps) => {
  const [boolean, setBoolean] = useCustomFieldState(field);
  return (
    <CustomCheckbox
      checked={boolean}
      text={label}
      error={errors.join(", ")}
      onChange={() => {
        setBoolean(!boolean);
      }}
      dataCy={getFieldViewTestId(field.name)}
    />
  );
};
