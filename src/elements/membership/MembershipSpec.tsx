import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { undefinedDropdownValue } from "../../plugin/helpers/constants";

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
