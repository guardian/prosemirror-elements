import { Column, Columns } from "@guardian/src-layout";
import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
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
}) => {
  //It is necessary to filter errors for the HTML field as we have two validators.
  //The first is meant to display a warning to the user, the second blocks publication.
  const htmlErrors = errors.html.length
    ? [
        errors.html.reduce((acc, cur) => {
          if (acc.level === "WARN") {
            return acc;
          } else {
            return cur;
          }
        }),
      ]
    : [];

  return (
    <div data-cy={PullquoteElementTestId}>
      <Columns>
        <Column width={2 / 3}>
          <FieldWrapper
            label="Pullquote"
            field={fields.html}
            errors={htmlErrors}
          />
        </Column>
        <Column width={1 / 3}>
          <FieldLayoutVertical>
            <FieldWrapper
              label="Attribution"
              field={fields.attribution}
              errors={errors.attribution}
            />
            <CustomDropdownView label="Weighting" field={fields.role} />
          </FieldLayoutVertical>
        </Column>
      </Columns>
    </div>
  );
};
