import React from "react";
import { createReactEmbedRenderer } from "../../mounters/react/mount";
import { ImageEmbed } from "./ImageEmbed";

export const imageProps = [
  {
    type: "richText",
    name: "caption",
  },
  {
    type: "richText",
    name: "altText",
  },
] as const;

export const createImageEmbed = <Name extends string>(name: Name) =>
  createReactEmbedRenderer(
    name,
    imageProps,
    (fields, errors, updateFields, nodeViewPropMap) => {
      return (
        <ImageEmbed
          fields={fields}
          errors={errors}
          updateFields={updateFields}
          nodeViewPropMap={nodeViewPropMap}
        />
      );
    },
    ({ alt }) => (alt ? null : { alt: ["Alt tag must be set"] }),
    { caption: "", src: "", alt: "" }
  );
