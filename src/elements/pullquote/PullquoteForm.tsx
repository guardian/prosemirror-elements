import React from "react";
import { Label } from "../../editorial-source-components/Label";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { FieldNameToFieldViewSpec } from "../../plugin/types/Element";
import { FieldView } from "../../renderers/react/FieldView";
import type { createPullquoteFields } from "./PullquoteSpec";

type Props = {
  fields: FieldNameToValueMap<ReturnType<typeof createPullquoteFields>>;
  errors: Record<string, string[]>;
  fieldViewSpecMap: FieldNameToFieldViewSpec<
    ReturnType<typeof createPullquoteFields>
  >;
};

export const PullquoteElementTestId = "PullquoteElement";

export const PullquoteElementForm: React.FunctionComponent<Props> = ({
  errors,
  fieldViewSpecMap: fieldViewSpecs,
}) => (
  <div data-cy={PullquoteElementTestId}>
    <FieldView fieldViewSpec={fieldViewSpecs.pullquote} />
    <FieldView fieldViewSpec={fieldViewSpecs.attribution} />
    <FieldView fieldViewSpec={fieldViewSpecs.weighting} />
    <hr />
    <Label>Element errors</Label>
    <pre>{JSON.stringify(errors)}</pre>
    <hr />
  </div>
);
