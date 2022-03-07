import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { unescapeHtml } from "../helpers/html";
import type { tableFields } from "./TableSpec";

type Props = {
  fieldValues: FieldNameToValueMap<typeof tableFields>;
  errors: FieldValidationErrors;
  fields: FieldNameToField<typeof tableFields>;
};

export const TableForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
  fieldValues,
}) => (
  <div>
    <FieldLayoutVertical>
      <div
        dangerouslySetInnerHTML={{
          __html: unescapeHtml(fieldValues.html),
        }}
      />
      <CustomDropdownView
        field={fields.role}
        label="Weighting"
        errors={errors.role}
        display="inline"
      />
    </FieldLayoutVertical>
  </div>
);
