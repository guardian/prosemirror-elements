import { Column, Columns } from "@guardian/src-layout";
import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { pullquoteFields } from "./PullquoteSpec";

type Props = {
  fields: FieldNameToField<typeof pullquoteFields>;
};

export const PullquoteElementTestId = "PullquoteElement";

export const PullquoteElementForm: React.FunctionComponent<Props> = ({
  fields,
}) => {
  //It is necessary to filter errors for the HTML field as we have two overlapping length check validators.
  //We only want to show the smaller length check "warning" instead of the higher length check "error".
  //The desired behaviour is to display a "WARN" level error if there is one, otherwise show what's found.
  const htmlErrors = fields.html.errors.length
    ? [
        fields.html.errors.reduce((acc, cur) => {
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
            headingLabel="Pullquote"
            field={fields.html}
            errors={htmlErrors}
          />
        </Column>
        <Column width={1 / 3}>
          <FieldLayoutVertical>
            <FieldWrapper
              headingLabel="Attribution"
              field={fields.attribution}
            />
            <CustomDropdownView label="Weighting" field={fields.role} />
          </FieldLayoutVertical>
        </Column>
      </Columns>
    </div>
  );
};
