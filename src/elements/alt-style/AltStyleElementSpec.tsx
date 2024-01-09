import { createNestedElementField } from "../../plugin/fieldViews/NestedElementFieldView";
import { createRepeaterField } from "../../plugin/fieldViews/RepeaterFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";

export const altStyleFields = {
  takeaways: createRepeaterField({
    title: createTextField({
        placeholder: "Enter title..."
    }),
    content: createNestedElementField({
        isResizeable: true,
        marks: "em strong link",
        content: "block+"
    })
  })
};
