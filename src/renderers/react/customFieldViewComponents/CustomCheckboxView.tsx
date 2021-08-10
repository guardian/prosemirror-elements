import { CustomCheckbox } from "../../../editorial-source-components/CustomCheckbox";
import type { CustomFieldViewSpec } from "../../../plugin/types/Element";
import { getFieldViewTestId } from "../FieldView";
import { useCustomFieldViewState } from "../useCustomFieldViewState";

type CustomCheckboxViewProps = {
  fieldViewSpec: CustomFieldViewSpec<boolean, boolean>;
  errors: string[];
  label: string;
};

export const CustomCheckboxView = ({
  fieldViewSpec,
  errors,
  label,
}: CustomCheckboxViewProps) => {
  const [boolean, setBoolean] = useCustomFieldViewState(fieldViewSpec);
  return (
    <CustomCheckbox
      checked={boolean}
      text={label}
      error={errors.join(", ")}
      onChange={() => {
        if (setBoolean.current) {
          setBoolean.current(!boolean);
        }
      }}
      dataCy={getFieldViewTestId(fieldViewSpec.name)}
    />
  );
};
