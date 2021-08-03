import React from "react";
import { Label } from "../../editorial-source-components/Label";
import { CustomCheckboxView } from "../../plugin/fieldViews/CustomCheckboxView";
import { CustomDropdownView } from "../../plugin/fieldViews/CustomDropdownView";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { FieldNameToFieldViewSpec } from "../../plugin/types/Element";
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
