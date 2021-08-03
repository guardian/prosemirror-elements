import { css } from "@emotion/react";
import { space } from "@guardian/src-foundations";
import React from "react";
import { Label } from "../../editorial-source-components/Label";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { FieldNameToFieldViewSpec } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { FieldView } from "../../renderers/react/FieldView";
import type { createPullquoteFields } from "./PullquoteSpec";

type Props = {
  fields: FieldNameToValueMap<ReturnType<typeof createPullquoteFields>>;
  errors: Record<string, string[]>;
  fieldViewSpecMap: FieldNameToFieldViewSpec<
    ReturnType<typeof createPullquoteFields>
  >;
};

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

export const PullquoteElementTestId = "PullquoteElement";

export const PullquoteElementForm: React.FunctionComponent<Props> = ({
  errors,
  fieldViewSpecMap: fieldViewSpecs,
}) => (
  <div data-cy={PullquoteElementTestId}>
    <div css={wrapper}>
      <div css={[column, primaryColumn]}>
        <FieldView fieldViewSpec={fieldViewSpecs.pullquote} />
      </div>
      <div css={column}>
        <FieldView fieldViewSpec={fieldViewSpecs.attribution} />
        <CustomDropdownView fieldViewSpec={fieldViewSpecs.weighting} />
      </div>
    </div>
    <hr />
    <Label>Element errors</Label>
    <pre>{JSON.stringify(errors)}</pre>
    <hr />
  </div>
);
