import React from "react";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { RichlinkElementForm } from "./RichlinkForm";

export const richlinkFields = {
  linkText: createTextField(),
  role: createCustomDropdownField("thumbnail", [
    { text: "thumbnail", value: "thumbnail" },
    { text: "supporting", value: "supporting" },
  ]),
  url: createTextField(),
  originalUrl: createTextField(),
  linkPrefix: createTextField(),
  draftReference: createTextField({ absentOnEmpty: true }),
  sponsorName: createTextField({ absentOnEmpty: true }),
  sponsorshipType: createTextField({ absentOnEmpty: true }),
  isMandatory: createCustomField(true, true),
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
