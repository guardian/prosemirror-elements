import React from "react";
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { htmlRequired } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { PullquoteElementForm } from "./PullquoteForm";

export const pullquoteFields = {
  html: createTextField({
    rows: 4,
    validators: [htmlRequired("Pullquote cannot be empty")],
    absentOnEmpty: true,
  }),
  attribution: createTextField({ absentOnEmpty: true }),
  role: createCustomDropdownField("supporting", [
    { text: "supporting (default)", value: "supporting" },
    { text: "inline", value: "inline" },
    { text: "showcase", value: "showcase" },
  ]),
};

export const pullquoteElement = createReactElementSpec(
  pullquoteFields,
  (fields, errors) => {
    return <PullquoteElementForm errors={errors} fields={fields} />;
  }
);
