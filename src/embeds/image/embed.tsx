import React from "react";
import { createReactEmbedRenderer } from "../../mounters/react/mount";
import { ImageEmbed } from "./ImageEmbed";

export const imageProps = {
  caption: {
    type: "richText",
  },
  altText: {
    type: "richText",
  },
  useSrc: { type: "checkbox", defaultValue: false },
} as const;

export const createImageEmbed = <Name extends string>(name: Name) =>
  createReactEmbedRenderer(
    name,
    imageProps,
    (_, errors, __, nodeViewPropMap) => {
      return <ImageEmbed errors={errors} nodeViewPropMap={nodeViewPropMap} />;
    },
    ({ alt }) => (alt ? null : { alt: ["Alt tag must be set"] }),
    { caption: "", src: "", alt: "" }
  );
