import React from "react";
import { PropView } from "../../mounters/react/PropView";
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
      <PropView nodeViewProp={nodeViewPropMap.altText} />
      <PropView nodeViewProp={nodeViewPropMap.caption} />
      <PropView nodeViewProp={nodeViewPropMap.useSrc} />
    </div>
  );
};
