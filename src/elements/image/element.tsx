import React from "react";
import type { DropdownFields } from "../../fieldViews/DropdownFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import type { CustomField } from "../../types/Element";
import { ImageElement } from "./ImageElement";

export const imageProps = {
  caption: {
    type: "richText",
  },
  altText: {
    type: "richText",
  },
  src: {
    type: "text",
  },
  mainImage: {
    type: "custom",
    defaultValue: { src: "" },
  } as CustomField<{ src: string }>,
  useSrc: {
    type: "checkbox",
    defaultValue: { value: false },
  },
  optionDropdown: {
    type: "dropdown",
    options: [
      { text: "Option 1", value: "opt1" },
      { text: "Option 2", value: "opt2" },
      { text: "Option 3", value: "opt3" },
    ],
    defaultValue: "opt1",
  },
} as const;

export const createImageElement = <Name extends string>(name: Name) =>
  createReactElementSpec(
    name,
    imageProps,
    (fields, errors, __, fieldViewPropMap) => {
      return (
        <ImageElement
          fields={fields}
          errors={errors}
          fieldViewPropMap={fieldViewPropMap}
        />
      );
    },
    ({ altText }) => {
      const el = document.createElement("div");
      el.innerHTML = altText;
      return el.innerText ? null : { altText: ["Alt tag must be set"] };
    },
    {
      caption: "",
      useSrc: { value: true },
      altText: "",
      mainImage: { src: "" },
      src: "",
      optionDropdown: "opt1",
    }
  );
