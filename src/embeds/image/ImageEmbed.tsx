import React from "react";
import { NodeViewPropField } from "../../mounters/react/propFields/PropField";
import type { NodeViewPropMapFromProps } from "../../types/Embed";
import type { TFields } from "../../types/Fields";
import type { imageProps } from "./embed";

type Props = {
  fields: TFields;
  errors: Record<string, string[]>;
  updateFields: (fields: TFields) => void;
  nodeViewPropMap: NodeViewPropMapFromProps<typeof imageProps>;
};

export const ImageEmbedTestId = "ImageEmbed";

export const ImageEmbed: React.FunctionComponent<Props> = ({
  fields: { src, alt },
  nodeViewPropMap,
}) => {
  return (
    <div data-cy={ImageEmbedTestId}>
      <NodeViewPropField nodeViewProp={nodeViewPropMap.altText} />
      <NodeViewPropField nodeViewProp={nodeViewPropMap.caption} />
    </div>
  );
};
