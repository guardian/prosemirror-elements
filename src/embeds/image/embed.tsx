import type { NodeSpec } from "prosemirror-model";
import React from "react";
import { createReactRenderer } from "../../mounters/react/mount";
import type { TEmbed } from "../../types/Embed";
import { ImageEmbed } from "./ImageEmbed";
import type { TImageFields } from "./types/Fields";

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

const defaultImageFields: TImageFields = {
  caption: "",
  src: "",
  alt: "",
};

export const createImageEmbed = ({
  editSrc = false,
} = {}): TEmbed<TImageFields> =>
  createReactRenderer<TImageFields>(defaultImageFields)(
    (fields, errors, updateFields, nestedEditors) => {
      return (
        <ImageEmbed
          fields={fields}
          errors={errors}
          updateFields={updateFields}
          editSrc={editSrc}
          nestedEditors={nestedEditors}
        />
      );
    },
    ({ alt }) => (alt ? null : { alt: ["Alt tag must be set"] }),
    { caption: "", src: "", alt: "" }
  );
