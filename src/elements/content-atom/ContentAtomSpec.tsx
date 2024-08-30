import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { undefinedDropdownValue } from "../../plugin/helpers/constants";

export type ContentAtomData = {
  defaultHtml: string;
  hasUnpublishedChanges: boolean;
  isPublished: boolean;
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
  jsonData: createTextField({
    rows: 4,
    isResizeable: true,
  }),
  role: createCustomDropdownField(undefinedDropdownValue, [
    { text: "inline (default)", value: undefinedDropdownValue },
    { text: "Immersive", value: "immersive" },
  ]),
  isMandatory: createCustomField(true, true),
};
