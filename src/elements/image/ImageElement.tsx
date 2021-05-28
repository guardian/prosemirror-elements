import React from "react";
import type { FieldNameToValueMap } from "../../nodeViews/helpers";
import { PropView } from "../../renderers/react/PropView";
import { useCustomNodeViewState } from "../../renderers/react/useCustomNodeViewState";
import type {
  CustomNodeViewSpec,
  FieldNameToNodeViewSpec,
} from "../../types/Element";
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
      <ImageView nodeViewProp={nodeViewPropMap.mainImage} />
      <hr />
      <h4>Element errors</h4>
      <pre>{JSON.stringify(errors)}</pre>
      <hr />
      <h4>Element values</h4>
      <pre>{JSON.stringify(fields)}</pre>
    </div>
  );
};

type ImageViewProps = {
  nodeViewProp: CustomNodeViewSpec<{
    src: string;
  }>;
};

const ImageView = ({ nodeViewProp }: ImageViewProps) => {
  const [imageFields, setImageFields] = useCustomNodeViewState(nodeViewProp);
  return (
    <div>
      <input
        value={imageFields.src || ""}
        onChange={(e) => setImageFields?.({ src: e.target.value })}
      ></input>
      {JSON.stringify(imageFields)}
    </div>
  );
};
