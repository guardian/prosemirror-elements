import { css } from "@emotion/react";
import { SvgAlertTriangle } from "@guardian/src-icons";
import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { richlinkFields } from "./RichlinkSpec";

type Props = {
  fieldValues: FieldNameToValueMap<typeof richlinkFields>;
  errors: FieldValidationErrors;
  fields: FieldNameToField<typeof richlinkFields>;
};

const warningStyle = css`
  font-family: "Guardian Agate Sans";
  font-size: 0.9375em;
  font-style: normal;
  font-weight: 400;
  line-height: 1em;
  letter-spacing: 0em;
  text-align: left;
  color: #c7291c;
  svg {
    fill: #c7291c;
    height: 1.2em;
    top: 0.25em;
    position: relative;
    left: 0.045em;
  }
`;

const warningContainer = css`
  height: 1.25em;
  width: 41.43em;
  left: 1.25em;
  top: 0em;
  border-radius: nullpx;
`;

export const RichlinkElementForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
  fieldValues,
}) => (
  <FieldLayoutVertical>
    <div>
      Related:{" "}
      <a target="_blank" href={fieldValues.url}>
        {fieldValues.linkText}
      </a>
    </div>
    <CustomDropdownView
      field={fields.role}
      label="Weighting"
      errors={errors.weighting}
      display="inline"
    />
    {fieldValues.draftReference ? (
      <div css={warningContainer}>
        <span css={warningStyle}>
          <SvgAlertTriangle />
          This rich link references unpublished content. It will not appear
          until the target has been published.
        </span>
      </div>
    ) : null}
  </FieldLayoutVertical>
);
