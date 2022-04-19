import React from "react";
import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { undefinedDropdownValue } from "../helpers/transform";
import { ContentAtomForm } from "./ContentAtomForm";

export type ContentAtomData = {
  defaultHtml: string;
  published: boolean;
  title: string;
  embedLink: string;
  editorLink: string;
};

export type FetchContentAtomData = (
  atomType: string,
  id: string
) => Promise<ContentAtomData>;

export const contentAtomFields = {
  id: createTextField(),
  atomType: createTextField(),
  role: createCustomDropdownField(undefinedDropdownValue, [
    { text: "inline (default)", value: undefinedDropdownValue },
    { text: "Immersive", value: "immersive" },
  ]),
  isMandatory: createCustomField(true, true),
};

export const createContentAtomElement = (
  fetchContentAtomData: FetchContentAtomData
) =>
  createReactElementSpec(
    contentAtomFields,
    ({ fields, errors, fieldValues }) => {
      return (
        <ContentAtomForm
          fields={fields}
          errors={errors}
          fieldValues={fieldValues}
          fetchContentAtomData={fetchContentAtomData}
        />
      );
    }
  );
