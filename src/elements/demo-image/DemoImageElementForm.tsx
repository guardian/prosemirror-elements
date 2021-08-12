import React from "react";
import { Field } from "../../editorial-source-components/Field";
import { Label } from "../../editorial-source-components/Label";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type {
  CustomFieldViewSpec,
  FieldNameToFieldViewSpec,
} from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { getFieldViewTestId } from "../../renderers/react/FieldView";
import { useCustomFieldViewState } from "../../renderers/react/useCustomFieldViewState";
import type { createImageFields, SetMedia } from "./DemoImageElement";

type Props = {
  fields: FieldNameToValueMap<ReturnType<typeof createImageFields>>;
  errors: Record<string, string[]>;
  fieldViewSpecs: FieldNameToFieldViewSpec<
    ReturnType<typeof createImageFields>
  >;
};

export const ImageElementTestId = "ImageElement";
export const UpdateAltTextButtonId = "UpdateAltTextButton";

export const ImageElementForm: React.FunctionComponent<Props> = ({
  fields,
  errors,
  fieldViewSpecs,
}) => (
  <div data-cy={ImageElementTestId}>
    <Field
      label="Caption"
      fieldViewSpec={fieldViewSpecs.caption}
      errors={errors.caption}
    />
    <Field
      label="Alt text"
      fieldViewSpec={fieldViewSpecs.altText}
      errors={errors.altText}
    />
    <button
      data-cy={UpdateAltTextButtonId}
      onClick={() => fieldViewSpecs.altText.update("Default alt text")}
    >
      Programmatically update alt text
    </button>
    <Field
      fieldViewSpec={fieldViewSpecs.restrictedTextField}
      label="Restricted Text Field"
      errors={errors.restrictedTextField}
    />
    <Field label="Src" fieldViewSpec={fieldViewSpecs.src} errors={errors.src} />
    <Field
      label="Code"
      fieldViewSpec={fieldViewSpecs.code}
      errors={errors.code}
    />
    <Field
      label="Use image source?"
      fieldViewSpec={fieldViewSpecs.useSrc}
      errors={errors.useSrc}
    />
    <Field
      label="Options"
      fieldViewSpec={fieldViewSpecs.optionDropdown}
      errors={errors.optionDropdown}
    />
    <ImageView
      fieldViewSpec={fieldViewSpecs.mainImage}
      onChange={(_, __, ___, description) => {
        fieldViewSpecs.altText.update(description);
        fieldViewSpecs.caption.update(description);
      }}
    />
    <CustomDropdownView
      label="Options"
      fieldViewSpec={fieldViewSpecs.customDropdown}
    />
    <hr />
    <Label>Element errors</Label>
    <pre>{JSON.stringify(errors)}</pre>
    <hr />
    <Label>Element values</Label>
    <pre>{JSON.stringify(fields)}</pre>
  </div>
);

type ImageViewProps = {
  onChange: SetMedia;
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

const ImageView = ({ fieldViewSpec, onChange }: ImageViewProps) => {
  const [imageFields, setImageFieldsRef] = useCustomFieldViewState(
    fieldViewSpec
  );

  const setMedia = (
    mediaId: string,
    mediaApiUri: string,
    assets: string[],
    description: string
  ) => {
    if (setImageFieldsRef.current) {
      setImageFieldsRef.current({ mediaId, mediaApiUri, assets });
    }
    onChange(mediaId, mediaApiUri, assets, description);
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
