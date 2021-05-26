import React from "react";
import { createReactEmbedSpec } from "../../renderers/react/createReactEmbedSpec";
import { ImageEmbed } from "./ImageEmbed";

export const imageProps = {
  caption: {
    type: "richText",
  },
  altText: {
    type: "richText",
  },
  useSrc: { type: "checkbox", defaultValue: { value: false } },
} as const;

export const createImageEmbed = <Name extends string>(name: Name) =>
  createReactEmbedSpec(
    name,
    imageProps,
    (fields, errors, __, nodeViewPropMap) => {
      return (
        <ImageEmbed
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
    { caption: "", useSrc: { value: true }, altText: "" }
  );
