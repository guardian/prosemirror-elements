import { createNestedField } from "../../plugin/fieldViews/NestedFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { required } from "../../plugin/helpers/validation";

export const altStyleFields = {
  title: createTextField({
    rows: 1,
    isResizeable: false,
    validators: [required("Title is required")],
  }),
  content: createNestedField({
    placeholder: "Don't show description",
    content: "(element|block)*",
    isResizeable: true,
    marks: "em strong link",
  }),
};
