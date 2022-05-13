import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Preview } from "../helpers/Preview";
import type { commentFields } from "./CommentSpec";

type Props = {
  fields: FieldNameToField<typeof commentFields>;
};

export const CommentElementForm: React.FunctionComponent<Props> = ({
  fields,
}) => (
  <>
    <FieldLayoutVertical>
      <Preview headingLabel={""} html={fields.html.value} />
      <CustomDropdownView
        field={fields.role}
        label="Weighting"
        display="inline"
      />
    </FieldLayoutVertical>
  </>
);
