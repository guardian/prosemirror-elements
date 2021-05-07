import React from "react";
import { NestedEditorView } from "../../mounters/react/NestedEditorView";
import type { NestedEditorMap } from "../../types/Embed";
import type { TImageFields } from "./types/Fields";

type Props = {
  fields: TImageFields;
  errors: Record<string, string[]>;
  updateFields: (fields: Partial<TImageFields>) => void;
  // @todo Make this schema specific to the embed once created
  nestedEditors: NestedEditorMap;
  editSrc: boolean;
};

export const ImageEmbedTestId = "ImageEmbed";

export const ImageEmbed: React.FunctionComponent<Props> = ({
  fields: { src, alt },
  nestedEditors,
}) => (
  <div data-cy={ImageEmbedTestId}>
    <img style={{ width: "250px", height: "auto" }} src={src} alt={alt} />
    {Object.entries(nestedEditors).map(([nameType, editor]) => (
      <NestedEditorView key={nameType} name={nameType} editor={editor} />
    ))}
  </div>
);
