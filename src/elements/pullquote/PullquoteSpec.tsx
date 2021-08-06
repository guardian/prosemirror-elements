import React from "react";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createValidator, required } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { PullquoteElementForm } from "./PullquoteForm";

export const pullquoteFields = {
    pullquote: createTextField({ isMultiline: true, rows: 4 }),
    attribution: createTextField(),
    weighting: createCustomField("supporting", [
      { text: "supporting (default)", value: "supporting" },
      { text: "inline", value: "inline" },
      { text: "showcase", value: "showcase" },
    ]),
};

export const pullquoteElement = createReactElementSpec(
  pullquoteFields,
  (_, errors, __, fieldViewSpecs) => {
    return <PullquoteElementForm errors={errors} fieldViewSpecs={fieldViewSpecs} />;
  },
  createValidator({ pullquote: [required()] }),
  {
    pullquote: "",
    attribution: "",
    weighting: "supporting",
  }
);
function htmlrequired(): (fieldValue: unknown) => string[] {
  throw new Error("Function not implemented.");
}

