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
  MediaPayload,
  SetMedia,
} from "./ImageElement";

type Props = {
  fieldViewSpecMap: FieldNameToFieldViewSpec<
    ReturnType<typeof createImageFields>
  >;
};

type ImageViewProps = {
  onChange: SetMedia;
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
    <FieldView fieldViewSpec={fieldViewSpecs.imageType} />
    <FieldView fieldViewSpec={fieldViewSpecs.displayCreditInformation} />
    <ImageView
      fieldViewSpec={fieldViewSpecs.mainImage}
      onChange={({ caption, source, photographer }) => {
        fieldViewSpecs.caption.update(caption);
        fieldViewSpecs.source.update(source);
        fieldViewSpecs.photographer.update(photographer);
      }}
    />
  </div>
);

const ImageView = ({ fieldViewSpec, onChange }: ImageViewProps) => {
  const [imageFields, setImageFieldsRef] = useCustomFieldViewState(
    fieldViewSpec
  );
  const setMedia = (mediaPayload: MediaPayload) => {
    const { mediaId, mediaApiUri, assets, suppliersReference } = mediaPayload;
    if (setImageFieldsRef.current) {
      setImageFieldsRef.current({
        mediaId,
        mediaApiUri,
        assets,
        suppliersReference,
      });
    }
    onChange(mediaPayload);
  };
  return (
    <>
      {JSON.stringify(imageFields)}
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
