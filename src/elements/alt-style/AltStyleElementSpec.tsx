import { createNestedElementField } from "../../plugin/fieldViews/NestedElementFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { required } from "../../plugin/helpers/validation";

export const altStyleFields = {
  title: createTextField({
    rows: 1,
    isResizeable: false,
    validators: [required("Title is required")],
  }),
  content: createNestedElementField({
    placeholder: "Don't show description",
    content: "block*",
    isResizeable: true,
    marks: "em strong link",
  }),
};
