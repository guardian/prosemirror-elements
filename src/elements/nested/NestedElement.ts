import { createNestedElementField } from "../../plugin/fieldViews/NestedElementFieldView";
import { createRepeaterField } from "../../plugin/fieldViews/RepeaterFieldView";

export const nestedElementFields = {
  repeater: createRepeaterField(
    {
      content: createNestedElementField({
        isResizeable: false,
        content: "block*",
        minRows: 6,
      }),
    },
    1
  ),
};
