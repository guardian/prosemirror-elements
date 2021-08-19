import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { embedFields } from "./EmbedSpec";

type Props = {
  fieldValues: FieldNameToValueMap<typeof embedFields>;
  errors: Record<string, string[]>;
  fields: FieldNameToField<typeof embedFields>;
};

export const EmbedElementTestId = "EmbedElement";

export const EmbedElementForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
}) => (
  <div data-cy={EmbedElementTestId}>
    <CustomDropdownView
      field={fields.weighting}
      label="Weighting"
      errors={errors.weighting}
    />
    <FieldWrapper
      field={fields.sourceUrl}
      errors={errors.sourceUrl}
      label="Source URL"
    />
    <FieldWrapper
      field={fields.embedCode}
      errors={errors.embedCode}
      label="Embed code"
    />
    <FieldWrapper
      field={fields.caption}
      errors={errors.caption}
      label="Caption"
    />
    <FieldWrapper
      field={fields.altText}
      errors={errors.altText}
      label="Alt text"
    />
    <CustomCheckboxView
      field={fields.required}
      errors={errors.required}
      label="This element is required for publication"
    />
  </div>
);
