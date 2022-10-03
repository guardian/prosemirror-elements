import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { Label } from "../../editorial-source-components/Label";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { CustomField, FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { getFieldViewTestId } from "../../renderers/react/FieldView";
import { useCustomFieldState } from "../../renderers/react/useCustomFieldViewState";
import type { createImageFields, DemoSetMedia } from "./DemoImageElement";

type Props = {
  fieldValues: FieldNameToValueMap<ReturnType<typeof createImageFields>>;
  errors: FieldValidationErrors;
  fields: FieldNameToField<ReturnType<typeof createImageFields>>;
};

export const ImageElementTestId = "ImageElement";
export const UpdateAltTextButtonId = "UpdateAltTextButton";

export const ImageElementForm: React.FunctionComponent<Props> = ({
  fields,
  errors,
  fieldValues,
}) => (
  <FieldLayoutVertical data-cy={ImageElementTestId}>
    <FieldWrapper
      headingLabel="Caption"
      field={fields.caption}
      errors={errors.caption}
    />
    <button
      onClick={() => fields.caption.view.updatePlaceholder("A new placeholder")}
    >
      Update caption placeholder
    </button>
    <FieldWrapper
      headingLabel="Alt text"
      field={fields.altText}
      errors={errors.altText}
    />
    <button
      data-cy={UpdateAltTextButtonId}
      onClick={() => fields.altText.update("Default alt text")}
    >
      Programmatically update alt text
    </button>
    <FieldWrapper
      headingLabel="Resizeable Text Field"
      field={fields.resizeable}
      errors={errors.resizeable}
    />
    <FieldWrapper
      field={fields.restrictedTextField}
      headingLabel="Restricted Text Field"
      errors={errors.restrictedTextField}
    />
    <FieldWrapper headingLabel="Src" field={fields.src} errors={errors.src} />
    <FieldWrapper
      headingLabel="Code"
      field={fields.code}
      errors={errors.code}
    />
    <FieldWrapper
      headingLabel="Use image source?"
      field={fields.useSrc}
      errors={errors.useSrc}
    />
    <FieldWrapper
      headingLabel="Options"
      field={fields.optionDropdown}
      errors={errors.optionDropdown}
    />
    <ImageView
      field={fields.mainImage}
      onChange={(_, __, ___, description) => {
        fields.altText.update(description);
        fields.caption.update(description);
      }}
    />
    <CustomDropdownView label="Options" field={fields.customDropdown} />
    <hr />
    <Label>Element errors</Label>
    <pre>{JSON.stringify(errors)}</pre>
    <hr />
    <Label>Element values</Label>
    <pre>{JSON.stringify(fieldValues)}</pre>
  </FieldLayoutVertical>
);

type ImageViewProps = {
  onChange: DemoSetMedia;
  field: CustomField<
    {
      mediaId?: string;
      mediaApiUri?: string;
      assets: string[];
    },
    {
      onSelectImage: (setMedia: DemoSetMedia) => void;
      onCropImage: (mediaId: string, setMedia: DemoSetMedia) => void;
    }
  >;
};

const ImageView = ({ field, onChange }: ImageViewProps) => {
  const [imageFields, setImageFields] = useCustomFieldState(field);

  const setMedia = (
    mediaId: string,
    mediaApiUri: string,
    assets: string[],
    description: string
  ) => {
    setImageFields({ mediaId, mediaApiUri, assets });
    onChange(mediaId, mediaApiUri, assets, description);
  };

  return (
    <div data-cy={getFieldViewTestId(field.name)}>
      {imageFields.assets.length > 0 ? (
        <img style={{ width: "25%" }} src={imageFields.assets[0]}></img>
      ) : null}

      {imageFields.mediaId ? (
        <button
          onClick={() => {
            if (imageFields.mediaId) {
              field.description.props.onCropImage(
                imageFields.mediaId,
                setMedia
              );
            } else {
              field.description.props.onSelectImage(setMedia);
            }
          }}
        >
          Crop Image
        </button>
      ) : (
        <button onClick={() => field.description.props.onSelectImage(setMedia)}>
          Choose Image
        </button>
      )}
    </div>
  );
};
