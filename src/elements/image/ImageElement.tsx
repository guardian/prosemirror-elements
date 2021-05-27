import React, { useEffect, useRef, useState } from "react";
import type { FieldNameToValueMap } from "../../nodeViews/helpers";
import type { ImageFields } from "../../nodeViews/ImageNodeView";
import { ImageNodeView } from "../../nodeViews/ImageNodeView";
import { PropView } from "../../renderers/react/PropView";
import type {
  FieldNameToNodeViewSpec,
  FieldNodeViewSpec,
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
  nodeViewProp: FieldNodeViewSpec<ImageNodeView>;
}) => {
  const [imageFields, setImageFields] = useSubscriberNodeView(nodeViewProp);
  console.log({ imageFields, setImageFields });
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

const useSubscriberNodeView = ({
  fieldSpec,
  nodeView,
}: FieldNodeViewSpec<ImageNodeView>): [
  ImageFields,
  ((fields: ImageFields) => void) | undefined
] => {
  const [imageFields, setImageFields] = useState(
    (fieldSpec.defaultValue as ImageFields | undefined) ??
      ImageNodeView.defaultValue
  );

  const updateRef = useRef<(fields: ImageFields) => void | undefined>();

  useEffect(() => {
    if (!(nodeView instanceof ImageNodeView)) {
      console.error(
        `[prosemirror-elements]: An ImageView component was passed a nodeView that wasn't an ImageNodeView. Instead it got a ${typeof nodeView}`
      );
      return;
    }
    updateRef.current = nodeView.subscribe(setImageFields);

    return () => nodeView.unsubscribe(setImageFields);
  }, []);

  return [imageFields, updateRef.current];
};
