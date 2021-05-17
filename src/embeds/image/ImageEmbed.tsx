import React from "react";
import { NodeViewPropField } from "../../mounters/react/propFields/PropField";
import type { NodeViewPropMapFromProps } from "../../types/Embed";
import type { imageProps } from "./embed";

type Props = {
  errors: Record<string, string[]>;
  nodeViewPropMap: NodeViewPropMapFromProps<typeof imageProps>;
};

export const ImageEmbedTestId = "ImageEmbed";

export const ImageEmbed: React.FunctionComponent<Props> = ({
  nodeViewPropMap,
}) => {
  return (
    <div data-cy={ImageEmbedTestId}>
      <NodeViewPropField nodeViewProp={nodeViewPropMap.altText} />
      <NodeViewPropField nodeViewProp={nodeViewPropMap.caption} />
      <NodeViewPropField nodeViewProp={nodeViewPropMap.useSrc} />
    </div>
  );
};
