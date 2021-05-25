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
  { type: "checkbox", name: "useSrc", defaultValue: false },
] as const;

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
