import React from "react";
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createValidator, htmlRequired } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { PullquoteElementForm } from "./PullquoteForm";

export const pullquoteFields = {
  pullquote: createTextField({ isMultiline: true, rows: 4 }),
  attribution: createTextField(),
  weighting: createCustomDropdownField("supporting", [
    { text: "supporting (default)", value: "supporting" },
    { text: "inline", value: "inline" },
    { text: "showcase", value: "showcase" },
  ]),
};

export const pullquoteElement = createReactElementSpec(
  pullquoteFields,
  (_, errors, __, fields) => {
    return <PullquoteElementForm errors={errors} fields={fields} />;
  },
  createValidator({ pullquote: [htmlRequired()] })
);
