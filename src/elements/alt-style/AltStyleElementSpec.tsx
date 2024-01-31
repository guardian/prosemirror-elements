import { createNestedElementField } from "../../plugin/fieldViews/NestedElementFieldView";
import { createRepeaterField } from "../../plugin/fieldViews/RepeaterFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { required } from "../../plugin/helpers/validation";
import { useTyperighterAttrs } from "../helpers/typerighter";

export const keyTakeawaysFields = {
  repeater: createRepeaterField(
    {
      title: createTextField({
        rows: 1,
        isResizeable: false,
        validators: [required("Title is required")],
      }),
      content: createNestedElementField({
        isResizeable: false,
        placeholder: "Don't show description",
        content: "block*",
        marks: "em strong link",
        attrs: useTyperighterAttrs,
        minRows: 6,
        validators: [required("Content is required")],
    }),
    },
    1
  ),
};
