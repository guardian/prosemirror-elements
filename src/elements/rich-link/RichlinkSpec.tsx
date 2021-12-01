import React from "react";
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { RichlinkElementForm } from "./RichlinkForm";

export const richlinkFields = {
  linkText: createTextField(),
  weighting: createCustomDropdownField("thumbnail", [
    { text: "thumbnail", value: "thumbnail" },
    { text: "supporting", value: "supporting" },
  ]),
  role: createTextField(),
  url: createTextField(),
  originalUrl: createTextField(),
  linkPrefix: createTextField(),
};

export const richlinkElement = createReactElementSpec(
  richlinkFields,
  ({ fields, errors, fieldValues }) => {
    return (
      <RichlinkElementForm
        fields={fields}
        errors={errors}
        fieldValues={fieldValues}
      />
    );
  }
);
