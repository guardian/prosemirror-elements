import { Column, Columns } from "@guardian/src-layout";
import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { pullquoteFields } from "./PullquoteSpec";

type Props = {
  errors: FieldValidationErrors;
  fields: FieldNameToField<typeof pullquoteFields>;
};

export const PullquoteElementTestId = "PullquoteElement";

export const PullquoteElementForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
}) => (
  <div data-cy={PullquoteElementTestId}>
    <Columns>
      <Column width={2 / 3}>
        <FieldWrapper
          label="Pullquote"
          field={fields.pullquote}
          errors={errors.pullquote}
        />
      </Column>
      <Column width={1 / 3}>
        <FieldWrapper
          label="Attribution"
          field={fields.attribution}
          errors={errors.attribution}
        />
        <CustomDropdownView label="Weighting" field={fields.weighting} />
      </Column>
    </Columns>
  </div>
);
