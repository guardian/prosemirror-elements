import { CustomCheckbox } from "../../editorial-source-components/CustomCheckbox";
import { getFieldViewTestId } from "../../renderers/react/FieldView";
import { useCustomFieldViewState } from "../../renderers/react/useCustomFieldViewState";
import type { CustomFieldViewSpec } from "../types/Element";

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
