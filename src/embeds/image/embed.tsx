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

export const imageEmbed = createReactEmbedRenderer(
  imageProps,
  (fields, errors, updateFields, nestedEditors) => {
    return (
      <ImageEmbed
        fields={fields}
        errors={errors}
        updateFields={updateFields}
        nestedEditors={nestedEditors}
      />
    );
  },
  ({ alt }) => (alt ? null : { alt: ["Alt tag must be set"] }),
  { caption: "", src: "", alt: "" }
);
