import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Preview } from "../helpers/Preview";
import type { commentFields } from "./CommentSpec";

type Props = {
  fieldValues: FieldNameToValueMap<typeof commentFields>;
  errors: FieldValidationErrors;
  fields: FieldNameToField<typeof commentFields>;
};

export const CommentElementForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
  fieldValues,
}) => (
  <>
    <FieldLayoutVertical>
      <Preview headingLabel={""} html={fieldValues.html} />
      <CustomDropdownView
        field={fields.role}
        label="Weighting"
        errors={errors.weighting}
        display="inline"
      />
    </FieldLayoutVertical>
  </>
);
