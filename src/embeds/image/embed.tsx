import React from "react";
import { reactMount } from "../../mounters/react/mount";
import type { TEmbed } from "../../types/Embed";
import { ImageEmbed } from "./ImageEmbed";
import type { TImageFields } from "./types/Fields";

export const createImageEmbed = ({
  editSrc = false,
} = {}): TEmbed<TImageFields> =>
  reactMount<TImageFields>(
    (fields, errors, updateFields) => (
      <ImageEmbed
        fields={fields}
        errors={errors}
        updateFields={updateFields}
        editSrc={editSrc}
      />
    ),
    ({ alt }) => (alt ? null : { alt: ["Alt tag must be set"] }),
    { caption: "", src: "", alt: "" }
  );
