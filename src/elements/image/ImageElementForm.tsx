import React from "react";
import type {
  CustomFieldViewSpec,
  FieldNameToFieldViewSpec,
} from "../../plugin/types/Element";
import { FieldView } from "../../renderers/react/FieldView";
import { useCustomFieldViewState } from "../../renderers/react/useCustomFieldViewState";
import type {
  createImageFields,
  MainImageData,
  MainImageProps,
} from "./ImageElement";

type Props = {
  fieldViewSpecMap: FieldNameToFieldViewSpec<
    ReturnType<typeof createImageFields>
  >;
};

type ImageViewProps = {
  fieldViewSpec: CustomFieldViewSpec<MainImageData, MainImageProps>;
};

export const ImageElementTestId = "ImageElement";

export const ImageElementForm: React.FunctionComponent<Props> = ({
  fieldViewSpecMap: fieldViewSpecs,
}) => (
  <div data-cy={ImageElementTestId}>
    <FieldView fieldViewSpec={fieldViewSpecs.altText} />
    <FieldView fieldViewSpec={fieldViewSpecs.caption} />
    <FieldView fieldViewSpec={fieldViewSpecs.photographer} />
    <FieldView fieldViewSpec={fieldViewSpecs.weighting} />
    <ImageView fieldViewSpec={fieldViewSpecs.mainImage} />
  </div>
);

const ImageView = ({ fieldViewSpec }: ImageViewProps) => {
  const [imageFields, setImageFieldsRef] = useCustomFieldViewState(
    fieldViewSpec
  );
  const setMedia = (mediaId: string, mediaApiUri: string, assets: string[]) => {
    if (setImageFieldsRef.current) {
      setImageFieldsRef.current({ mediaId, mediaApiUri, assets });
    }
  };
  return (
    <>
      <div>Test Image Selector</div>
      <button
        onClick={() => {
          fieldViewSpec.fieldSpec.props.openImageSelector(
            setMedia,
            imageFields.mediaId
          );
        }}
      >
        Select Image
      </button>
    </>
  );
};
