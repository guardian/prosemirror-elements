import React from "react";
import { CustomCheckbox } from "../../editorial-source-components/CustomCheckbox";
import { Label } from "../../editorial-source-components/Label";
import { CustomDropdownView } from "../../plugin/fieldViews/CustomDropdownView";
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
    <CustomCheckboxView fieldViewSpec={fieldViewSpecs.required} />

    <hr />
    <Label>Element errors</Label>
    <pre>{JSON.stringify(errors)}</pre>
    <hr />
    <Label>Element values</Label>
    <pre>{JSON.stringify(fields)}</pre>
  </div>
);

type CustomCheckboxViewProps = {
  fieldViewSpec: CustomFieldViewSpec<boolean, boolean>;
};

const CustomCheckboxView = ({ fieldViewSpec }: CustomCheckboxViewProps) => {
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
