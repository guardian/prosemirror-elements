import { createRepeaterField } from "../../plugin/fieldViews/RepeaterFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";

export const repeaterElementFields = {
  repeater: createRepeaterField({
    repeaterText: createTextField(),
    nestedRepeater: createRepeaterField({
      nestedRepeaterText: createTextField(),
    }),
  }),
};
