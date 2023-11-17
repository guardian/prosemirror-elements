import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { required } from "../../plugin/helpers/validation";

export const altStyleFields = {
  title: createTextField({
    rows: 1,
    isResizeable: false,
    validators: [required("Title is required")],
  }),
  content: createRichTextField({
    isResizeable: true,
    validators: [required("Content is required")],
  }),
};
