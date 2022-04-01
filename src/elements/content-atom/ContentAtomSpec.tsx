import React from "react";
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { undefinedDropdownValue } from "../helpers/transform";
import { ContentAtomForm } from "./ContentAtomForm";

export type ContentAtomData = {
  html: string;
  published: boolean;
  title: string;
  embedLink: string;
  editorLink: string;
};

export type FetchContentAtomData = (
  id: string,
  atomType: string
) => ContentAtomData;

export const contentAtomFields = {
  id: createTextField(),
  atomType: createTextField(),
  role: createCustomDropdownField(undefinedDropdownValue, [
    { text: "inline (default)", value: undefinedDropdownValue },
    { text: "Immersive", value: "immersive" },
  ]),
};

export const createContentAtomElement = (
  fetchContentAtomData: FetchContentAtomData
) =>
  createReactElementSpec(contentAtomFields, ({ fieldValues }) => {
    return (
      <ContentAtomForm
        fieldValues={fieldValues}
        fetchContentAtomData={fetchContentAtomData}
      />
    );
  });
