import React from "react";
import { NestedEditorView } from "../../mounters/react/NestedEditorView";
import type { NestedEditorMapFromProps } from "../../types/Embed";
import type { TFields } from "../../types/Fields";
import type { imageProps } from "./embed";

type Props = {
  fields: TFields;
  errors: Record<string, string[]>;
  updateFields: (fields: TFields) => void;
  // @todo Make this schema specific to the embed once created
  nestedEditors: NestedEditorMapFromProps<typeof imageProps>;
};

export const ImageEmbedTestId = "ImageEmbed";

export const ImageEmbed: React.FunctionComponent<Props> = ({
  fields: { src, alt },
  nestedEditors,
}) => (
  <div data-cy={ImageEmbedTestId}>
    <img style={{ width: "250px", height: "auto" }} src={src} alt={alt} />
    <NestedEditorView
      key={"altText"}
      name={"altText"}
      editor={nestedEditors.altText}
    />
    <NestedEditorView
      key={"caption"}
      name={"caption"}
      editor={nestedEditors.caption}
    />
  </div>
);
