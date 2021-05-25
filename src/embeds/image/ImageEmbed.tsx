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
  errors,
  nodeViewPropMap,
}) => {
  return (
    <div data-cy={ImageEmbedTestId}>
      <PropView nodeViewProp={nodeViewPropMap.altText} />
      <PropView nodeViewProp={nodeViewPropMap.caption} />
      <PropView nodeViewProp={nodeViewPropMap.useSrc} />
      <hr />
      <h4>Embed errors</h4>
      <pre>{JSON.stringify(errors)}</pre>
      <hr />
      <h4>Embed values</h4>
      <pre>{JSON.stringify(fields)}</pre>
    </div>
  );
};
