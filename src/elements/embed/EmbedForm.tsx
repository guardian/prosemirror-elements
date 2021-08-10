import React from "react";
import { Label } from "../../editorial-source-components/Label";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { FieldNameToFieldViewSpec } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { FieldView } from "../../renderers/react/FieldView";
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
    <CustomDropdownView
      fieldViewSpec={fieldViewSpecs.weighting}
      label="Weighting"
      errors={errors.weighting}
    />
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
