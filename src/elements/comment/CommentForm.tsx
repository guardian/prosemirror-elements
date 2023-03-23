import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Preview } from "../helpers/Preview";
import { commentFields } from "./CommentSpec";

export const commentElement = createReactElementSpec(
  commentFields,
  ({ fields }) => (
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
  )
);
