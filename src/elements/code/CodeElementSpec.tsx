import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { required } from "../../plugin/helpers/validation";

export const codeFields = {
  html: createTextField({
    rows: 4,
    isResizeable: true,
    isCode: true,
    validators: [required("empty code field")],
    absentOnEmpty: true,
  }),
  language: createCustomDropdownField("text", [
    { text: "Plain text", value: "text" },
    { text: "HTML", value: "html" },
    { text: "CSS", value: "css" },
    { text: "JavaScript", value: "javascript" },
    { text: "Java", value: "java" },
    { text: "Ruby", value: "ruby" },
    { text: "Scala", value: "scala" },
    { text: "YAML", value: "yaml" },
  ]),
};
