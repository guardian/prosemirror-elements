import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import type { CustomField } from "../../plugin/types/Element";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { getFieldViewTestId } from "../../renderers/react/FieldComponent";
import { useCustomFieldState } from "../../renderers/react/useCustomFieldViewState";
import { createImageFields } from "./DemoImageElement";
import type { DemoSetMedia } from "./DemoImageElement";

export const ImageElementTestId = "ImageElement";
export const UpdateAltTextButtonId = "UpdateAltTextButton";
export const AddRepeaterButtonId = "AddRepeaterButton";
export const AddNestedRepeaterButtonId = "AddNestedRepeaterButton";
export const RemoveRepeaterButtonId = "RemoveRepeaterButton";
export const RemoveNestedRepeaterButtonId = "RemoveNestedRepeaterButton";

export const createDemoImageElement = (
  onSelect: (setSrc: DemoSetMedia) => void,
  onCrop: (mediaId: string, setSrc: DemoSetMedia) => void
) =>
  createReactElementSpec({
    fieldDescriptions: createImageFields(onSelect, onCrop),
    component: ({ fields }) => (
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
        <ul>
          {fields.repeater.children.map((repeater, index) => (
            <li key={repeater.__ID}>
              <FieldWrapper
                headingLabel="Repeater text"
                headingContent={
                  <button
                    data-cy={RemoveRepeaterButtonId}
                    onClick={() => fields.repeater.view.remove(index)}
                  >
                    -
                  </button>
                }
                field={repeater.repeaterText}
              />
              <ul>
                {repeater.nestedRepeater.children.map(
                  (nestedRepeater, index) => (
                    <li key={nestedRepeater.__ID}>
                      <FieldWrapper
                        headingLabel="Nested repeater text"
                        headingContent={
                          <button
                            data-cy={RemoveNestedRepeaterButtonId}
                            onClick={() =>
                              repeater.nestedRepeater.view.remove(index)
                            }
                          >
                            -
                          </button>
                        }
                        field={nestedRepeater.nestedRepeaterText}
                      />
                    </li>
                  )
                )}
              </ul>
              <button
                data-cy={AddNestedRepeaterButtonId}
                onClick={() => repeater.nestedRepeater.view.add()}
              >
                +
              </button>
            </li>
          ))}
          <button
            data-cy={AddRepeaterButtonId}
            onClick={() => fields.repeater.view.add()}
          >
            +
          </button>
        </ul>
      </FieldLayoutVertical>
    ),
  });

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
