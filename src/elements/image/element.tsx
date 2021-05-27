import React from "react";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomField } from "../../types/Element";
import { ImageElement } from "./ImageElement";

export const imageProps = {
  caption: {
    type: "richText",
  },
  altText: {
    type: "richText",
  },
  mainImage: {
    type: "image",
  },
  custom: {
    type: "custom",
  } as CustomField<{ wut: string }>,
  useSrc: { type: "checkbox", defaultValue: { value: false } },
} as const;

export const createImageElement = <Name extends string>(name: Name) =>
  createReactElementSpec(
    name,
    imageProps,
    (fields, errors, __, nodeViewPropMap) => {
      return (
        <ImageElement
          fields={fields}
          errors={errors}
          nodeViewPropMap={nodeViewPropMap}
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
      custom: { wut: "hai" },
    }
  );
