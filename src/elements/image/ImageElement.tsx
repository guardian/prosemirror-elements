import _ from "cypress/types/lodash";
import React from "react";
import type { FieldNameToValueMap } from "../../fieldViews/helpers";
import { getPropViewTestId, PropView } from "../../renderers/react/PropView";
import { useCustomFieldViewState } from "../../renderers/react/useCustomFieldViewState";
import type {
  CustomFieldViewSpec,
  FieldNameToFieldViewSpec,
} from "../../types/Element";
import type { imageProps, SetSrc } from "./element";

type Props = {
  fields: FieldNameToValueMap<ReturnType<typeof imageProps>>;
  errors: Record<string, string[]>;
  fieldViewPropMap: FieldNameToFieldViewSpec<ReturnType<typeof imageProps>>;
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
      <PropView fieldViewProp={fieldViewPropMap.optionDropdown} />
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
  fieldViewProp: CustomFieldViewSpec<
    {
      src: string;
    },
    {
      onSelect: (setSrc: SetSrc) => void;
      onCrop: (src: string, setSrc: SetSrc) => void;
    }
  >;
};

const ImageView = ({ fieldViewProp }: ImageViewProps) => {
  const [imageFields, setImageFieldsRef] = useCustomFieldViewState(
    fieldViewProp
  );

  const setSrc = (src: string) => {
    if (setImageFieldsRef.current) {
      setImageFieldsRef.current({ src });
    }
  };

  return (
    <div data-cy={getPropViewTestId(fieldViewProp.name)}>
      <img style={{ width: "25%" }} src={imageFields.src}></img>
      <button onClick={() => fieldViewProp.fieldSpec.props.onSelect(setSrc)}>
        Choose Image
      </button>
      <button
        onClick={() =>
          fieldViewProp.fieldSpec.props.onCrop(imageFields.src, setSrc)
        }
      >
        Crop Image
      </button>
      <button onClick={() => setSrc("")}>Remove Image</button>
      {JSON.stringify(imageFields)}
    </div>
  );
};
