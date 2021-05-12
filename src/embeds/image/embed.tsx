import type { NodeSpec } from "prosemirror-model";
import React from "react";
import { createReactEmbedRenderer } from "../../mounters/react/mount";
import { ImageEmbed } from "./ImageEmbed";

export const imageSchemaSpec: NodeSpec = {
  caption: {
    group: "block",
    content: "paragraph",
    toDOM() {
      return ["div", { class: "imageNative-caption" }, 0];
    },
    parseDOM: [{ tag: "div" }],
  },
  altText: {
    group: "block",
    content: "paragraph",
    toDOM() {
      return ["div", { class: "imageNative-altText" }, 0];
    },
    parseDOM: [{ tag: "div" }],
  },
  imageEmbed: {
    group: "caption altText",
    attrs: {
      type: {},
      fields: {
        default: {},
      },
      hasErrors: {
        default: false,
      },
    },
  },
};

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
