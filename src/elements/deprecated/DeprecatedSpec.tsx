import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";

export const fields = {
  type: createTextField(),
  data: createCustomField("", undefined),
};
