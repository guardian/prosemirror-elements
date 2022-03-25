import React from "react";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { ContentAtomForm } from "./ContentAtomForm";

export const contentAtomFields = {
  id: createTextField(),
  atomType: createTextField(),
};

export const contentAtomElement = createReactElementSpec(
  contentAtomFields,
  ({ fieldValues }) => {
    return <ContentAtomForm fieldValues={fieldValues} />;
  }
);
