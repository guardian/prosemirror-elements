import { Column, Columns } from "@guardian/src-layout";
import React from "react";
import { Field } from "../../editorial-source-components/Field";
import type { FieldNameToFieldViewSpec } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { pullquoteFields } from "./PullquoteSpec";

type Props = {
  errors: Record<string, string[]>;
  fieldViewSpecs: FieldNameToFieldViewSpec<typeof pullquoteFields>;
};

export const PullquoteElementTestId = "PullquoteElement";

export const PullquoteElementForm: React.FunctionComponent<Props> = ({
  errors,
  fieldViewSpecs,
}) => (
  <div data-cy={PullquoteElementTestId}>
    <Columns>
      <Column width={2 / 3}>
        <Field
          label="Pullquote"
          fieldViewSpec={fieldViewSpecs.pullquote}
          errors={errors.pullquote}
        />
      </Column>
      <Column width={1 / 3}>
        <Field
          label="Attribution"
          fieldViewSpec={fieldViewSpecs.attribution}
          errors={errors.attribution}
        />
        <CustomDropdownView
          label="Weighting"
          fieldViewSpec={fieldViewSpecs.weighting}
        />
      </Column>
    </Columns>
  </div>
);
