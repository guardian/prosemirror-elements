import { CustomCheckbox } from "../../../editorial-source-components/CustomCheckbox";
import type { CustomField } from "../../../plugin/types/Element";
import { getFieldViewTestId } from "../FieldView";
import { useCustomFieldState } from "../useCustomFieldViewState";

type CustomCheckboxViewProps = {
  field: CustomField<boolean, boolean>;
  label: string;
};

export const CustomCheckboxView = ({
  field,
  label,
}: CustomCheckboxViewProps) => {
  const [boolean, setBoolean] = useCustomFieldState(field);
  return (
    <CustomCheckbox
      checked={boolean}
      text={label}
      error={field.errors.map((e) => e.error).join(", ")}
      onChange={() => {
        setBoolean(!boolean);
      }}
      dataCy={getFieldViewTestId(field.name)}
    />
  );
};
