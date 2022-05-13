import styled from "@emotion/styled";
import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { tableFields } from "./TableSpec";

const TableWrapper = styled.div`
  white-space: initial;
`;

type Props = {
  fields: FieldNameToField<typeof tableFields>;
};

export const TableForm: React.FunctionComponent<Props> = ({ fields }) => (
  <div>
    <FieldLayoutVertical>
      <TableWrapper
        dangerouslySetInnerHTML={{
          __html: fields.html.value,
        }}
      />
      <CustomDropdownView
        field={fields.role}
        label="Weighting"
        display="inline"
      />
    </FieldLayoutVertical>
  </div>
);
