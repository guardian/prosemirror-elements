import React from "react";
import { Label } from "../../editorial-source-components/Label";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type {
  CustomFieldViewSpec,
  FieldNameToFieldViewSpec,
} from "../../plugin/types/Element";
import { getPropViewTestId, PropView } from "../../renderers/react/PropView";
import { useCustomFieldViewState } from "../../renderers/react/useCustomFieldViewState";
import type { imageProps, SetMedia } from "./ImageElement";

type Props = {
  fields: FieldNameToValueMap<ReturnType<typeof imageProps>>;
  errors: Record<string, string[]>;
  fieldViewPropMap: FieldNameToFieldViewSpec<ReturnType<typeof imageProps>>;
};

export const ImageElementTestId = "ImageElement";

export const ImageElementForm: React.FunctionComponent<Props> = ({
  fields,
  errors,
  fieldViewPropMap,
}) => (
  <div data-cy={ImageElementTestId}>
    <PropView fieldViewProp={fieldViewPropMap.altText} />
    <PropView fieldViewProp={fieldViewPropMap.caption} />
    <PropView fieldViewProp={fieldViewPropMap.src} />
    <PropView fieldViewProp={fieldViewPropMap.useSrc} />
    <PropView fieldViewProp={fieldViewPropMap.optionDropdown} />
    <ImageView fieldViewProp={fieldViewPropMap.mainImage} />
    <hr />
    <Label>Element errors</Label>
    <pre>{JSON.stringify(errors)}</pre>
    <hr />
    <Label>Element values</Label>
    <pre>{JSON.stringify(fields)}</pre>
  </div>
);

type ImageViewProps = {
  fieldViewProp: CustomFieldViewSpec<
    {
      mediaId?: string;
      mediaApiUri?: string;
      assets: string[];
    },
    {
      onSelectImage: (setMedia: SetMedia) => void;
      onCropImage: (mediaId: string, setMedia: SetMedia) => void;
    }
  >;
};

const ImageView = ({ fieldViewProp }: ImageViewProps) => {
  const [imageFields, setImageFieldsRef] = useCustomFieldViewState(
    fieldViewProp
  );

  const setMedia = (mediaId: string, mediaApiUri: string, assets: string[]) => {
    if (setImageFieldsRef.current) {
      setImageFieldsRef.current({ mediaId, mediaApiUri, assets });
    }
  };

  return (
    <div data-cy={getPropViewTestId(fieldViewProp.name)}>
      {imageFields.assets.length > 0 ? (
        <img style={{ width: "25%" }} src={imageFields.assets[0]}></img>
      ) : null}

      {imageFields.mediaId ? (
        <button
          onClick={() => {
            if (imageFields.mediaId) {
              fieldViewProp.fieldSpec.props.onCropImage(
                imageFields.mediaId,
                setMedia
              );
            } else {
              fieldViewProp.fieldSpec.props.onSelectImage(setMedia);
            }
          }}
        >
          Crop Image
        </button>
      ) : (
        <button
          onClick={() => fieldViewProp.fieldSpec.props.onSelectImage(setMedia)}
        >
          Choose Image
        </button>
      )}
    </div>
  );
};
