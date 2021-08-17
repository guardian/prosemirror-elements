import { Column, Columns } from "@guardian/src-layout";
import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { pullquoteFields } from "./PullquoteSpec";

type Props = {
  errors: Record<string, string[]>;
  fieldViewSpecs: FieldNameToField<typeof pullquoteFields>;
};

export const PullquoteElementTestId = "PullquoteElement";

export const PullquoteElementForm: React.FunctionComponent<Props> = ({
  errors,
  fieldViewSpecs,
}) => (
  <div data-cy={PullquoteElementTestId}>
    <Columns>
      <Column width={2 / 3}>
        <FieldWrapper
          label="Pullquote"
          field={fieldViewSpecs.pullquote}
          errors={errors.pullquote}
        />
      </Column>
      <Column width={1 / 3}>
        <FieldWrapper
          label="Attribution"
          field={fieldViewSpecs.attribution}
          errors={errors.attribution}
        />
        <CustomDropdownView
          label="Weighting"
          field={fieldViewSpecs.weighting}
        />
      </Column>
    </Columns>
  </div>
);
