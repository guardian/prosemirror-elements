import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";

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
};
