import React from "react";
import type { FieldNameToValueMap } from "../../nodeViews/helpers";
import { PropView } from "../../renderers/react/PropView";
import type { FieldNameToNodeViewSpec } from "../../types/Element";
import type { imageProps } from "./element";

type Props = {
  fields: FieldNameToValueMap<typeof imageProps>;
  errors: Record<string, string[]>;
  nodeViewPropMap: FieldNameToNodeViewSpec<typeof imageProps>;
};

export const ImageElementTestId = "ImageElement";

export const ImageElement: React.FunctionComponent<Props> = ({
  fields,
  errors,
  nodeViewPropMap,
}) => {
  return (
    <div data-cy={ImageElementTestId}>
      <PropView nodeViewProp={nodeViewPropMap.altText} />
      <PropView nodeViewProp={nodeViewPropMap.caption} />
      <PropView nodeViewProp={nodeViewPropMap.useSrc} />
      <hr />
      <h4>Element errors</h4>
      <pre>{JSON.stringify(errors)}</pre>
      <hr />
      <h4>Element values</h4>
      <pre>{JSON.stringify(fields)}</pre>
    </div>
  );
};
