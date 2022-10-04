import type { Plugin } from "prosemirror-state";
import React from "react";
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { undefinedDropdownValue } from "../helpers/transform";
import { MembershipElementForm } from "./MembershipForm";

export const membershipFields = {
  role: createCustomDropdownField("inline", [
    { text: "inline (default)", value: undefinedDropdownValue },
    { text: "supporting", value: "supporting" },
    { text: "showcase", value: "showcase" },
    { text: "thumbnail", value: "thumbnail" },
    { text: "immersive", value: "immersive" },
  ]),
  linkText: createTextField(),
  identifier: createTextField(),
  image: createTextField(),
  originalUrl: createTextField(),
  price: createTextField(),
  linkPrefix: createTextField(),
  end: createTextField(),
  title: createTextField(),
  start: createTextField(),
  location: createTextField({ absentOnEmpty: true }),
  venue: createTextField({ absentOnEmpty: true }),
};

export const membershipElement = createReactElementSpec(
  membershipFields,
  ({ fields, errors, fieldValues }) => {
    return (
      <MembershipElementForm
        fields={fields}
        errors={errors}
        fieldValues={fieldValues}
      />
    );
  }
);
