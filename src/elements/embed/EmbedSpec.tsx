import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import {
  htmlMaxLength,
  maxLength,
  required,
} from "../../plugin/helpers/validation";
import { parseHtml } from "../helpers/html";
import type { MainEmbedOptions } from "./EmbedForm";

export const getCalloutTag = (html: string) => {
  const element = parseHtml(html);
  if (element) {
    const tagName = element.getAttribute("data-callout-tagname");

    if (tagName) {
      return tagName;
    }
  }
  return undefined;
};

export const createEmbedFields = ({
  createCaptionPlugins,
}: MainEmbedOptions) => ({
  role: createCustomDropdownField(undefinedDropdownValue, [
    { text: "inline (default)", value: undefinedDropdownValue },
    { text: "supporting", value: "supporting" },
    { text: "showcase", value: "showcase" },
    { text: "thumbnail", value: "thumbnail" },
    { text: "immersive", value: "immersive" },
  ]),
  url: createTextField({
    placeholder: "Enter the source URL for this embed…",
  }),
  html: createTextField({
    rows: 2,
    isCode: true,
    maxRows: 10,
    isResizeable: true,
    isMultiline: true,
    validators: [required(undefined, "WARN")],
    placeholder: "Paste in the embed code…",
  }),
  caption: createFlatRichTextField({
    createPlugins: createCaptionPlugins,
    marks: "em strong link strike",
    validators: [htmlMaxLength(1000, undefined, "WARN")],
    placeholder: "Enter a caption for this media…",
  }),
  alt: createTextField({
    rows: 2,
    isResizeable: true,
    validators: [maxLength(1000), required()],
    placeholder: "Enter some alt text…",
  }),
  isMandatory: createCustomField(true, true),
});
