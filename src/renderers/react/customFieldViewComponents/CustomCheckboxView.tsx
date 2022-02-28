import React from "react";
import { CustomCheckbox } from "../../../editorial-source-components/CustomCheckbox";
import type { ValidationError } from "../../../plugin/elementSpec";
import type { CustomField } from "../../../plugin/types/Element";
import { getFieldViewTestId } from "../FieldView";
import { useCustomFieldState } from "../useCustomFieldViewState";

type CustomCheckboxViewProps = {
  field: CustomField<boolean, boolean>;
  errors: ValidationError[];
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
      error={errors.map((e) => e.error).join(", ")}
      onChange={() => {
        setBoolean(!boolean);
      }}
      dataCy={getFieldViewTestId(field.name)}
    />
  );
};
