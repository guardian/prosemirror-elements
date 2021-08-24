import { css } from "@emotion/react";
import { Button } from "@guardian/src-button";
import { SvgCamera } from "@guardian/src-icons";
import { Column, Columns, Inline } from "@guardian/src-layout";
import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { CustomField, FieldNameToField } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { useCustomFieldState } from "../../renderers/react/useCustomFieldViewState";
import type {
  Asset,
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
  fields: FieldNameToField<ReturnType<typeof createImageFields>>;
};

type ImageViewProps = {
  onChange: SetMedia;
  field: CustomField<MainImageData, MainImageProps>;
};

export const ImageElementTestId = "ImageElement";

export const ImageElementForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
  fieldValues,
}) => (
  <div data-cy={ImageElementTestId}>
    <Columns>
      <Column width={2 / 5}>
        <CustomDropdownView
          field={fields.weighting}
          label="Weighting"
          errors={errors.weighting}
        />
        <ImageView
          field={fields.mainImage}
          onChange={({ caption, source, photographer }) => {
            fields.caption.update(caption);
            fields.source.update(source);
            fields.photographer.update(photographer);
          }}
        />
        <CustomDropdownView
          field={fields.imageType}
          label={"Image type"}
          errors={errors.imageType}
        />
      </Column>
      <Column width={3 / 5}>
        <FieldWrapper
          field={fields.caption}
          errors={errors.caption}
          label="Caption"
        />
        <Button
          priority="primary"
          size="xsmall"
          // icon={<SvgCamera />}
          iconSide="left"
          onClick={() => fields.altText.update(fieldValues.caption)}
        >
          Copy from caption
        </Button>
        <FieldWrapper
          field={fields.altText}
          errors={errors.altText}
          label="Alt text"
        />
        <Inline space={2}>
          <FieldWrapper
            field={fields.photographer}
            errors={errors.photographer}
            label="Photographer"
            css={inlineStyles}
          />
          <FieldWrapper
            field={fields.source}
            errors={errors.source}
            label="Source"
            css={inlineStyles}
          />
        </Inline>
        <CustomCheckboxView
          field={fields.displayCreditInformation}
          errors={errors.displayCreditInformation}
          label="Display credit information"
        />
      </Column>
    </Columns>
  </div>
);

const imageViewStysles = css`
  width: 100%;
`;

const ImageView = ({ field, onChange }: ImageViewProps) => {
  const [imageFields, setImageFields] = useCustomFieldState(field);
  const setMedia = (mediaPayload: MediaPayload) => {
    const { mediaId, mediaApiUri, assets, suppliersReference } = mediaPayload;
    setImageFields({
      mediaId,
      mediaApiUri,
      assets,
      suppliersReference,
    });
    onChange(mediaPayload);
  };

  const masterImageSource = imageFields.assets
    .filter((image) => image.fields.width >= 1000)
    .sort((assetA, assetB) => assetA.fields.width - assetB.fields.width)[0]
    ?.url;
  const isMaster = (asset: Asset) =>
    typeof asset.fields.isMaster !== "undefined"
      ? asset.fields.isMaster
      : false;
  const excludeMasterAsset = imageFields.assets.filter(
    (asset) => !isMaster(asset)
  );
  const assetsInAscWidth = excludeMasterAsset
    .filter((image) => image.fields.width < 1000)
    .sort((assetA, assetB) => assetA.fields.width - assetB.fields.width)
    .slice(-1)[0]?.url;
  return (
    <>
      <div>
        <img
          css={imageViewStysles}
          src={masterImageSource || assetsInAscWidth}
        />
      </div>
      <Button
        priority="primary"
        size="xsmall"
        icon={<SvgCamera />}
        iconSide="left"
        onClick={() => {
          field.description.props.openImageSelector(
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
