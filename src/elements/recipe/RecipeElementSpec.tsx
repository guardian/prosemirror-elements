import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { required } from "../../plugin/helpers/validation";

export const recipeFields = {
  recipeJson: createTextField({
    rows: 4,
    isResizeable: true,
    isCode: true,
    validators: [required("empty recipe field")],
    absentOnEmpty: true,
  }),
};
