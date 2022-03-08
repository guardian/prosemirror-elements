import styled from "@emotion/styled";
import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { tableFields } from "./TableSpec";

const TableWrapper = styled.div`
  white-space: initial;
`;

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
      <TableWrapper
        dangerouslySetInnerHTML={{
          __html: fieldValues.html,
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
