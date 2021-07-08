import React from "react";
import { CustomDropdown } from "../../editorial-source-components/CustomDropdown";
import { Label } from "../../editorial-source-components/Label";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type {
  CustomFieldViewSpec,
  FieldNameToFieldViewSpec,
  Option,
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
    <CustomDropdownView fieldViewSpec={fieldViewSpecs.customDropdown} />
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

type CustomDropdownViewProps = {
  fieldViewSpec: CustomFieldViewSpec<string, Array<Option<unknown>>>;
};

const CustomDropdownView = ({ fieldViewSpec }: CustomDropdownViewProps) => {
  const [selectedElement, setSelectFieldsRef] = useCustomFieldViewState(
    fieldViewSpec
  );
  return (
    <CustomDropdown
      options={fieldViewSpec.fieldSpec.props}
      selected={selectedElement}
      label={fieldViewSpec.name}
      changeHandler={(event) => {
        if (setSelectFieldsRef.current) {
          setSelectFieldsRef.current(JSON.parse(event.target.value));
        }
      }}
      dataCy={getFieldViewTestId(fieldViewSpec.name)}
    />
  );
};
