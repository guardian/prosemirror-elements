import React from "react";
import { Field } from "../../editorial-source-components/Field";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { FieldNameToFieldViewSpec } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
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
  errors,
  fieldViewSpecMap: fieldViewSpecs,
}) => (
  <div data-cy={EmbedElementTestId}>
    <CustomDropdownView
      fieldViewSpec={fieldViewSpecs.weighting}
      label="Weighting"
      errors={errors.weighting}
    />
    <Field
      fieldViewSpec={fieldViewSpecs.sourceUrl}
      errors={errors.sourceUrl}
      label="Source URL"
    />
    <Field
      fieldViewSpec={fieldViewSpecs.embedCode}
      errors={errors.embedCode}
      label="Embed code"
    />
    <Field
      fieldViewSpec={fieldViewSpecs.caption}
      errors={errors.caption}
      label="Caption"
    />
    <Field
      fieldViewSpec={fieldViewSpecs.altText}
      errors={errors.altText}
      label="Alt text"
    />
    <CustomCheckboxView
      fieldViewSpec={fieldViewSpecs.required}
      errors={errors.required}
      label="This element is required for publication"
    />
  </div>
);
