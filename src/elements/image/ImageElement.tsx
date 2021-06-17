import React from "react";
import type { FieldNameToValueMap } from "../../fieldViews/helpers";
import { getPropViewTestId, PropView } from "../../renderers/react/PropView";
import { useCustomFieldViewState } from "../../renderers/react/useCustomFieldViewState";
import type {
  CustomFieldViewSpec,
  FieldNameToFieldViewSpec,
} from "../../types/Element";
import type { imageProps } from "./element";

type Props = {
  fields: FieldNameToValueMap<typeof imageProps>;
  errors: Record<string, string[]>;
  fieldViewPropMap: FieldNameToFieldViewSpec<typeof imageProps>;
};

export const ImageElementTestId = "ImageElement";

export const ImageElement: React.FunctionComponent<Props> = ({
  fields,
  errors,
  fieldViewPropMap,
}) => {
  return (
    <div data-cy={ImageElementTestId}>
      <PropView fieldViewProp={fieldViewPropMap.altText} />
      <PropView fieldViewProp={fieldViewPropMap.caption} />
      <PropView fieldViewProp={fieldViewPropMap.src} />
      <PropView fieldViewProp={fieldViewPropMap.useSrc} />
      <ImageView fieldViewProp={fieldViewPropMap.mainImage} />
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
  fieldViewProp: CustomFieldViewSpec<{
    src: string;
  }>;
};

const ImageView = ({ fieldViewProp }: ImageViewProps) => {
  const [imageFields, setImageFieldsRef] = useCustomFieldViewState(
    fieldViewProp
  );
  return (
    <div data-cy={getPropViewTestId(fieldViewProp.name)}>
      <input
        value={imageFields.src || ""}
        onChange={(e) => setImageFieldsRef.current?.({ src: e.target.value })}
      ></input>
      {JSON.stringify(imageFields)}
    </div>
  );
};
