import { css } from "@emotion/react";
import { space } from "@guardian/src-foundations";
import React from "react";
import { Field } from "../../editorial-source-components/Field";
import { Label } from "../../editorial-source-components/Label";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { FieldNameToFieldViewSpec } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { FieldView } from "../../renderers/react/FieldView";
import type { pullquoteFields } from "./PullquoteSpec";

const wrapper = css`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const column = css`
  width: 33%;
`;

const primaryColumn = css`
  width: 67%;
  padding-right: ${space[3]}px;
  display: flex;
  flex-direction: column;
  div {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
`;

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
    <div css={wrapper}>
      <div css={[column, primaryColumn]}>
        <Field
      label="Pullquote"
      fieldViewSpec={fieldViewSpecs.pullquote}
      errors={errors.pullquote}
    />
      </div>
      <div css={column}>
      <Field
      label="Attribution"
      fieldViewSpec={fieldViewSpecs.attribution}
      errors={errors.attribution}
    />
        <CustomDropdownView label="Weighting" fieldViewSpec={fieldViewSpecs.weighting} />
      </div>
    </div>
    <hr />
    <Label>Element errors</Label>
    <pre>{JSON.stringify(errors)}</pre>
    <hr />
  </div>
);
