import React from "react";
import { PropField } from "../../mounters/react/propFields/PropField";
import type { NestedEditorMapFromProps } from "../../types/Embed";
import type { TFields } from "../../types/Fields";
import type { imageProps } from "./embed";

type Props = {
  fields: TFields;
  errors: Record<string, string[]>;
  updateFields: (fields: TFields) => void;
  nestedEditors: NestedEditorMapFromProps<typeof imageProps>;
};

export const ImageEmbedTestId = "ImageEmbed";

export const ImageEmbed: React.FunctionComponent<Props> = ({
  fields: { src, alt },
  nestedEditors,
}) => {
  return (
    <div data-cy={ImageEmbedTestId}>
      <PropField nodeViewProp={nestedEditors.altText} />
      <PropField nodeViewProp={nestedEditors.caption} />
    </div>
  );
};
