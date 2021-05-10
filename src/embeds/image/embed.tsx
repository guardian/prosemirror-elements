import type { NodeSpec } from "prosemirror-model";
import React from "react";
import { createReactEmbed } from "../../mounters/react/mount";
import type { ElementProps, TEmbed } from "../../types/Embed";
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
    type: "string",
    name: "caption",
  },
  {
    type: "string",
    name: "altText",
  },
] as const;

export const createImageEmbed = ({ editSrc = false } = {}): TEmbed<
  ElementProps[]
> =>
  createReactEmbed(
    // @todo Sneaky any whilst we work on the typings
    (fields, errors, updateFields, nestedEditors: any) => {
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
