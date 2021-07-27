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
import type { createEmbedFields } from "./EmbedSpec";

type Props = {
  fields: FieldNameToValueMap<ReturnType<typeof createEmbedFields>>;
  errors: Record<string, string[]>;
  fieldViewSpecMap: FieldNameToFieldViewSpec<
    ReturnType<typeof createEmbedFields>
  >;
};

export const EmbedElementTestId = "EmbedElement";

export const EmbedElementForm: React.FunctionComponent<Props> = ({
  fields,
  errors,
  fieldViewSpecMap: fieldViewSpecs,
}) => (
  <div data-cy={EmbedElementTestId}>
    <CustomDropdownView fieldViewSpec={fieldViewSpecs.weighting} />
    <FieldView fieldViewSpec={fieldViewSpecs.sourceUrl} />
    <FieldView fieldViewSpec={fieldViewSpecs.embedCode} />
    <FieldView fieldViewSpec={fieldViewSpecs.caption} />
    <FieldView fieldViewSpec={fieldViewSpecs.altText} />
    <FieldView fieldViewSpec={fieldViewSpecs.required} />

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
