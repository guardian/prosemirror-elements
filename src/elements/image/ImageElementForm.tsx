import React from "react";
import { Field } from "../../editorial-source-components/Field";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type {
  CustomFieldViewSpec,
  FieldNameToFieldViewSpec,
} from "../../plugin/types/Element";
import { useCustomFieldViewState } from "../../renderers/react/useCustomFieldViewState";
import type {
  createImageFields,
  MainImageData,
  MainImageProps,
  MediaPayload,
  SetMedia,
} from "./ImageElement";

type Props = {
  fieldValues: FieldNameToValueMap<ReturnType<typeof createImageFields>>;
  errors: Record<string, string[]>;
  fieldViewSpecs: FieldNameToFieldViewSpec<
    ReturnType<typeof createImageFields>
  >;
};

type ImageViewProps = {
  onChange: SetMedia;
  fieldViewSpec: CustomFieldViewSpec<MainImageData, MainImageProps>;
};

export const ImageElementTestId = "ImageElement";

export const ImageElementForm: React.FunctionComponent<Props> = ({
  errors,
  fieldViewSpecs,
  fieldValues,
}) => (
  <div data-cy={ImageElementTestId}>
    <Field
      fieldViewSpec={fieldViewSpecs.caption}
      errors={errors.caption}
      label="Caption"
    />
    <button onClick={() => fieldViewSpecs.altText.update(fieldValues.caption)}>
      Copy from caption
    </button>
    <Field
      fieldViewSpec={fieldViewSpecs.altText}
      errors={errors.altText}
      label="Alt text"
    />
    <Field
      fieldViewSpec={fieldViewSpecs.photographer}
      errors={errors.photographer}
      label="Photographer"
    />
    <Field
      fieldViewSpec={fieldViewSpecs.weighting}
      errors={errors.weighting}
      label="Weighting"
    />
    <Field
      fieldViewSpec={fieldViewSpecs.imageType}
      errors={errors.imageType}
      label="Image Types"
    />
    <Field
      fieldViewSpec={fieldViewSpecs.source}
      errors={errors.source}
      label="Source"
    />
    <Field
      fieldViewSpec={fieldViewSpecs.photographer}
      errors={errors.photographer}
      label="Photographer"
    />
    <Field
      fieldViewSpec={fieldViewSpecs.displayCreditInformation}
      errors={errors.displayCreditInformation}
      label="Credits"
    />
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
      {imageFields.assets.length > 0 ? (
        <img src={imageFields.assets[0].url} />
      ) : null}
      <button
        onClick={() => {
          fieldViewSpec.fieldSpec.props.openImageSelector(
            setMedia,
            imageFields.mediaId
          );
        }}
      >
        Re-crop image
      </button>
    </>
  );
};
