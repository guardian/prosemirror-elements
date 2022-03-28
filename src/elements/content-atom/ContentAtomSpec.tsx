import React from "react";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { ContentAtomForm } from "./ContentAtomForm";

export type ContentAtomData = {
  html: string;
  published: boolean;
  title: string;
};

export type FetchContentAtomData = (
  id: string,
  atomType: string
) => ContentAtomData;

export const contentAtomFields = {
  id: createTextField(),
  atomType: createTextField(),
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

// isAtomPublished // Doesn't see to be used
// hasAtomEditor // = atomType !== "interactive";
// elementTitle // atom.title
// elementPublished // atom.contentChangeDetails.published
// defaultHtml // if not quiz atom  // !previewAtom.defaultHtml
