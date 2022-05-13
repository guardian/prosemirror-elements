import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { CustomField, FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { getFieldViewTestId } from "../../renderers/react/FieldView";
import { useCustomFieldState } from "../../renderers/react/useCustomFieldViewState";
import type { createImageFields, DemoSetMedia } from "./DemoImageElement";

type Props = {
  fields: FieldNameToField<ReturnType<typeof createImageFields>>;
};

export const ImageElementTestId = "ImageElement";
export const UpdateAltTextButtonId = "UpdateAltTextButton";

export const ImageElementForm: React.FunctionComponent<Props> = ({
  fields,
}) => (
  <FieldLayoutVertical data-cy={ImageElementTestId}>
    <FieldWrapper headingLabel="Caption" field={fields.caption} />
    <FieldWrapper headingLabel="Alt text" field={fields.altText} />
    <button
      data-cy={UpdateAltTextButtonId}
      onClick={() => fields.altText.update("Default alt text")}
    >
      Programmatically update alt text
    </button>
    <FieldWrapper
      headingLabel="Resizeable Text Field"
      field={fields.resizeable}
    />
    <FieldWrapper
      field={fields.restrictedTextField}
      headingLabel="Restricted Text Field"
    />
    <FieldWrapper headingLabel="Src" field={fields.src} />
    <FieldWrapper headingLabel="Code" field={fields.code} />
    <FieldWrapper headingLabel="Use image source?" field={fields.useSrc} />
    <FieldWrapper headingLabel="Options" field={fields.optionDropdown} />
    <ImageView
      field={fields.mainImage}
      onChange={(_, __, ___, description) => {
        fields.altText.update(description);
        fields.caption.update(description);
      }}
    />
    <CustomDropdownView label="Options" field={fields.customDropdown} />
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
