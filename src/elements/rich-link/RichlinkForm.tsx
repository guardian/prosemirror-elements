import { css } from "@emotion/react";
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
  background-color: purple;
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
    <div css={warningStyle}>
      {fieldValues.draftReference ? (
        <div>TRUE DONE: {fieldValues.draftReference}</div>
      ) : (
        <div>TRY NOTER</div>
      )}
    </div>{" "}
  </FieldLayoutVertical>
);
