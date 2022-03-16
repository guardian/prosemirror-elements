import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { DeprecatedForm } from "./DeprecatedForm";

export const fields = {
  type: createTextField(),
  data: createCustomField("", undefined),
};

export const deprecatedElement = createReactElementSpec(fields, DeprecatedForm);
