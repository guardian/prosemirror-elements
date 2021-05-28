import React, { useEffect, useRef, useState } from "react";
import { CustomNodeView } from "../../nodeViews/CustomNodeView";
import type { FieldNameToValueMap } from "../../nodeViews/helpers";
import { PropView } from "../../renderers/react/PropView";
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

const ImageView = ({
  nodeViewProp,
}: {
  nodeViewProp: CustomNodeViewSpec<{
    src: string;
  }>;
}) => {
  const [imageFields, setImageFields] = useCustomNodeView(nodeViewProp);
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

const useCustomNodeView = <Data extends unknown>({
  fieldSpec,
  nodeView,
}: CustomNodeViewSpec<Data>): [Data, ((fields: Data) => void) | undefined] => {
  const [imageFields, setImageFields] = useState(fieldSpec.defaultValue);

  const updateRef = useRef<(fields: Data) => void | undefined>();

  useEffect(() => {
    if (!(nodeView instanceof CustomNodeView)) {
      console.error(
        `[prosemirror-elements]: An CustomNodeView component was passed a nodeView that wasn't a CustomNodeView. Instead it got a ${typeof nodeView}`
      );
      return;
    }
    updateRef.current = nodeView.subscribe(setImageFields);

    return () => nodeView.unsubscribe(setImageFields);
  }, []);

  return [imageFields, updateRef.current];
};
