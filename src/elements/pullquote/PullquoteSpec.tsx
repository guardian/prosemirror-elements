import React from "react";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { PullquoteElementForm } from "./PullquoteForm";

export const createPullquoteFields = () => {
  return {
    pullquote: createTextField({ isMultiline: true, rows: 4 }),
    attribution: createTextField(),
    weighting: createCustomField("supporting", [
      { text: "supporting (default)", value: "supporting" },
      { text: "inline", value: "inline" },
      { text: "showcase", value: "showcase" },
    ]),
  };
};

export const createPullquoteElement = () =>
  createReactElementSpec(
    createPullquoteFields(),
    (fields, errors, __, fieldViewSpecs) => {
      return (
        <PullquoteElementForm
          fields={fields}
          errors={errors}
          fieldViewSpecMap={fieldViewSpecs}
        />
      );
    },
    (fields) => {
      const el = document.createElement("div");
      el.innerHTML = fields.pullquote;
      const text = el.innerText;
      if (!text) {
        return { pullquote: ["Pullquote must be set"] };
      } else if (text.length >= 120) {
        return {
          pullquote: ["Pullquote length must be less that 120 Characters"],
        };
      } else {
        return null;
      }
    },
    {
      pullquote: "",
      attribution: "",
      weighting: "supporting",
    }
  );
