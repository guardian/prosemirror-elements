import React from "react";
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { maxLength, required } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { useTyperighterAttrs } from "../helpers/typerighter";
import { PullquoteElementForm } from "./PullquoteForm";

export const pullquoteFields = {
  html: createTextField({
    rows: 4,
    validators: [
      required("Pullquote cannot be empty"),
      //To display a warning to users
      maxLength(120, undefined, "WARN"),
      //To prevent publication
      maxLength(1000, "Pullquote is too long", "ERROR"),
    ],
    absentOnEmpty: true,
    placeholder: "Enter a pull quote here…",
    attrs: useTyperighterAttrs,
  }),
  attribution: createTextField({
    absentOnEmpty: true,
    placeholder: "Enter attribution here…",
  }),
  role: createCustomDropdownField("supporting", [
    { text: "supporting (default)", value: "supporting" },
    { text: "inline", value: "inline" },
    { text: "showcase", value: "showcase" },
  ]),
};

export const pullquoteElement = createReactElementSpec(
  pullquoteFields,
  ({ fields, errors }) => {
    return <PullquoteElementForm errors={errors} fields={fields} />;
  }
);
