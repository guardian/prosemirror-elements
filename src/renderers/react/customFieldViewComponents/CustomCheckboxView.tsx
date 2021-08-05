import { CustomCheckbox } from "../../../editorial-source-components/CustomCheckbox";
import type { CustomFieldViewSpec } from "../../../plugin/types/Element";
import { getFieldViewTestId } from "../FieldView";
import { useCustomFieldViewState } from "../useCustomFieldViewState";

type CustomCheckboxViewProps = {
  fieldViewSpec: CustomFieldViewSpec<boolean, boolean>;
};

export const CustomCheckboxView = ({
  fieldViewSpec,
}: CustomCheckboxViewProps) => {
  const [boolean, setBoolean] = useCustomFieldViewState(fieldViewSpec);
  return (
    <CustomCheckbox
      checked={boolean}
      text={fieldViewSpec.name}
      onChange={() => {
        if (setBoolean.current) {
          setBoolean.current(!boolean);
        }
      }}
      dataCy={getFieldViewTestId(fieldViewSpec.name)}
    />
  );
};
