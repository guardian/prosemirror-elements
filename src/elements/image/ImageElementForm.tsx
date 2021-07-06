import React from "react";
import { Label } from "../../editorial-source-components/Label";
import { createSelect } from "../../editorial-source-components/Select";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type {
  CustomFieldViewSpec,
  FieldNameToFieldViewSpec,
} from "../../plugin/types/Element";
import { FieldView, getFieldViewTestId } from "../../renderers/react/FieldView";
import { useCustomFieldViewState } from "../../renderers/react/useCustomFieldViewState";
import type { imageProps, SetMedia } from "./imageElement";

type Props = {
  fields: FieldNameToValueMap<ReturnType<typeof imageProps>>;
  errors: Record<string, string[]>;
  fieldViewSpecMap: FieldNameToFieldViewSpec<ReturnType<typeof imageProps>>;
};

export const ImageElementTestId = "ImageElement";

export const ImageElementForm: React.FunctionComponent<Props> = ({
  fields,
  errors,
  fieldViewSpecMap: fieldViewSpecs,
}) => (
  <div data-cy={ImageElementTestId}>
    <FieldView fieldViewSpec={fieldViewSpecs.altText} />
    <FieldView fieldViewSpec={fieldViewSpecs.caption} />
    <FieldView fieldViewSpec={fieldViewSpecs.src} />
    <FieldView fieldViewSpec={fieldViewSpecs.useSrc} />
    <FieldView fieldViewSpec={fieldViewSpecs.optionDropdown} />
    <ImageView fieldViewSpec={fieldViewSpecs.mainImage} />
    <SelectView fieldViewSpec={fieldViewSpecs.select} />
    <hr />
    <Label>Element errors</Label>
    <pre>{JSON.stringify(errors)}</pre>
    <hr />
    <Label>Element values</Label>
    <pre>{JSON.stringify(fields)}</pre>
  </div>
);

type ImageViewProps = {
  fieldViewSpec: CustomFieldViewSpec<
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
    <div data-cy={getFieldViewTestId(fieldViewSpec.name)}>
      {imageFields.assets.length > 0 ? (
        <img style={{ width: "25%" }} src={imageFields.assets[0]}></img>
      ) : null}

      {imageFields.mediaId ? (
        <button
          onClick={() => {
            if (imageFields.mediaId) {
              fieldViewSpec.fieldSpec.props.onCropImage(
                imageFields.mediaId,
                setMedia
              );
            } else {
              fieldViewSpec.fieldSpec.props.onSelectImage(setMedia);
            }
          }}
        >
          Crop Image
        </button>
      ) : (
        <button
          onClick={() => fieldViewSpec.fieldSpec.props.onSelectImage(setMedia)}
        >
          Choose Image
        </button>
      )}
    </div>
  );
};

type SelectViewProps = {
  fieldViewSpec: CustomFieldViewSpec<
    { options: Option[]; selected: string },
    undefined
  >;
};

type Option = {
  text: string;
  value: string;
};

const SelectView = ({ fieldViewSpec }: SelectViewProps) => {
  const [selectFields, setSelectFieldsRef] = useCustomFieldViewState(
    fieldViewSpec
  );
  return createSelect(selectFields.options, selectFields.selected, (event) => {
    if (setSelectFieldsRef.current) {
      setSelectFieldsRef.current({
        options: selectFields.options,
        selected: event.target.value,
      });
    }
  });
};
