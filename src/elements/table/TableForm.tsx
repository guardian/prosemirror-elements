import styled from "@emotion/styled";
import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { tableFields } from "./TableSpec";

const TableWrapper = styled.div`
  white-space: initial;
`;

export const tableElement = createReactElementSpec(
  tableFields,
  ({ fields }) => (
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
  )
);
