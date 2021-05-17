import React from "react";
import { PropView } from "../../mounters/react/PropView";
import type { FieldNameToValueMap } from "../../nodeViews/helpers";
import type { FieldNameToNodeViewSpec } from "../../types/Embed";
import type { imageProps } from "./embed";

type Props = {
  fields: FieldNameToValueMap<typeof imageProps>;
  errors: Record<string, string[]>;
  nodeViewPropMap: FieldNameToNodeViewSpec<typeof imageProps>;
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
