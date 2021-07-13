import React from "react";
import { createCheckBox } from "../../plugin/fieldViews/CheckboxFieldView";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import type { Option } from "../../plugin/fieldViews/DropdownFieldView";
import { createDropDownField } from "../../plugin/fieldViews/DropdownFieldView";
import { createDefaultRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";

export const imageFields = {
  altText: createTextField(),
  caption: createDefaultRichTextField(),
  displayText: createCheckBox(true),
  imageType: createDropDownField(
    [
      { text: "Photograph", value: "Photograph" },
      { text: "Illustration", value: "Illustration" },
      { text: "Composite", value: "Composite" },
    ],
    "Photograph"
  ),
  photographer: createTextField(),
  source: createTextField(),
  weighting: createDropDownField(
    [
      { text: "inline (default)", value: undefined },
      { text: "supporting", value: "supporting" },
      { text: "showcase", value: "showcase" },
      { text: "thumbnail", value: "thumbnail" },
      { text: "immersive", value: "immersive" },
    ],
    undefined
  ),
};
