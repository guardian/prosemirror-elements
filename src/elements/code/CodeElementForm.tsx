import React from "react";
import { CustomDropdown } from "../../editorial-source-components/CustomDropdown";
import { Label } from "../../editorial-source-components/Label";
import type { Option } from "../../plugin/fieldViews/DropdownFieldView";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type {
  CustomFieldViewSpec,
  FieldNameToFieldViewSpec,
} from "../../plugin/types/Element";
import { FieldView, getFieldViewTestId } from "../../renderers/react/FieldView";
import { useCustomFieldViewState } from "../../renderers/react/useCustomFieldViewState";
import type { createCodeFields } from "./CodeElementSpec";

type Props = {
  fields: FieldNameToValueMap<ReturnType<typeof createCodeFields>>;
  errors: Record<string, string[]>;
  fieldViewSpecMap: FieldNameToFieldViewSpec<
    ReturnType<typeof createCodeFields>
  >;
};

export const CodeElementTestId = "CodeElement";

export const CodeElementForm: React.FunctionComponent<Props> = ({
  fields,
  errors,
  fieldViewSpecMap: fieldViewSpecs,
}) => (
  <div data-cy={CodeElementTestId}>
    <FieldView fieldViewSpec={fieldViewSpecs.codeText} />
    <CustomDropdownView fieldViewSpec={fieldViewSpecs.language} />

    <hr />
    <Label>Element errors</Label>
    <pre>{JSON.stringify(errors)}</pre>
    <hr />
    <Label>Element values</Label>
    <pre>{JSON.stringify(fields)}</pre>
  </div>
);

type CustomDropdownViewProps = {
  fieldViewSpec: CustomFieldViewSpec<string, Array<Option<string>>>;
};

const CustomDropdownView = ({ fieldViewSpec }: CustomDropdownViewProps) => {
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
