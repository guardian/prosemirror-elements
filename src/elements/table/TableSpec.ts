import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { undefinedDropdownValue } from "../helpers/transform";
import { TableForm } from "./TableForm";

export const tableFields = {
  source: createTextField({ absentOnEmpty: true }),
  isMandatory: createCustomField(true, true),
  role: createCustomDropdownField(undefinedDropdownValue, [
    { text: "inline (default)", value: undefinedDropdownValue },
    { text: "supporting", value: "supporting" },
    { text: "showcase", value: "showcase" },
    { text: "immersive", value: "immersive" },
    { text: "thumbnail", value: "thumbnail" },
  ]),
  url: createTextField({ absentOnEmpty: true }),
  originalUrl: createTextField({ absentOnEmpty: true }),
  html: createTextField({ absentOnEmpty: true }),
  tableUrl: createTextField({ absentOnEmpty: true }),
};

export const tableElement = createReactElementSpec(tableFields, TableForm);
