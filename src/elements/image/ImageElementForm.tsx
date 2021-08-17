import { css } from "@emotion/react";
import { Button } from "@guardian/src-button";
import { SvgCamera } from "@guardian/src-icons";
import { Column, Columns, Inline } from "@guardian/src-layout";
import React from "react";
import { Field } from "../../editorial-source-components/Field";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type {
  CustomFieldViewSpec,
  FieldNameToFieldViewSpec,
} from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { useCustomFieldViewState } from "../../renderers/react/useCustomFieldViewState";
import type {
  createImageFields,
  MainImageData,
  MainImageProps,
  MediaPayload,
  SetMedia,
} from "./ImageElement";

const inlineStyles = css`
  width: 40%;
`;

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
    <Columns>
      <Column width={2 / 5}>
        <CustomDropdownView
          fieldViewSpec={fieldViewSpecs.weighting}
          label="Weighting"
          errors={errors.weighting}
        />
        <ImageView
          fieldViewSpec={fieldViewSpecs.mainImage}
          onChange={({ caption, source, photographer }) => {
            fieldViewSpecs.caption.update(caption);
            fieldViewSpecs.source.update(source);
            fieldViewSpecs.photographer.update(photographer);
          }}
        />
        <CustomDropdownView
          fieldViewSpec={fieldViewSpecs.imageType}
          label={"Image type"}
          errors={errors.imageType}
        />
      </Column>
      <Column width={3 / 5}>
        <Field
          fieldViewSpec={fieldViewSpecs.caption}
          errors={errors.caption}
          label="Caption"
        />
        <Button
          priority="primary"
          size="xsmall"
          // icon={<SvgCamera />}
          iconSide="left"
          onClick={() => fieldViewSpecs.altText.update(fieldValues.caption)}
        >
          Copy from caption
        </Button>
        <Field
          fieldViewSpec={fieldViewSpecs.altText}
          errors={errors.altText}
          label="Alt text"
        />
        <Inline space={2}>
          <Field
            fieldViewSpec={fieldViewSpecs.photographer}
            errors={errors.photographer}
            label="Photographer"
            css={inlineStyles}
          />
          <Field
            fieldViewSpec={fieldViewSpecs.source}
            errors={errors.source}
            label="Source"
            css={inlineStyles}
          />
        </Inline>
        <Field
          fieldViewSpec={fieldViewSpecs.displayCreditInformation}
          errors={errors.displayCreditInformation}
          label="Credits"
        />
      </Column>
    </Columns>
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
      <br></br>
      <Button
        priority="primary"
        size="xsmall"
        icon={<SvgCamera />}
        iconSide="left"
        onClick={() => {
          fieldViewSpec.fieldSpec.props.openImageSelector(
            setMedia,
            imageFields.mediaId
          );
        }}
      >
        Re-crop image
      </Button>
    </>
  );
};
