import React from "react";
import { PropView } from "../../mounters/react/PropView";
import type { NodeViewPropValues } from "../../nodeViews/helpers";
import type { NodeViewPropMap } from "../../types/Embed";
import type { imageProps } from "./embed";

type Props = {
  fields: NodeViewPropValues<typeof imageProps>;
  errors: Record<string, string[]>;
  nodeViewPropMap: NodeViewPropMap<typeof imageProps>;
};

export const ImageEmbedTestId = "ImageEmbed";

export const ImageEmbed: React.FunctionComponent<Props> = ({
  fields,
  nodeViewPropMap,
}) => {
  return (
    <div data-cy={ImageEmbedTestId}>
      {JSON.stringify(fields)}
      <PropView nodeViewProp={nodeViewPropMap.altText} />
      <PropView nodeViewProp={nodeViewPropMap.caption} />
      <PropView nodeViewProp={nodeViewPropMap.useSrc} />
    </div>
  );
};
