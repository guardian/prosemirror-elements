import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { SvgCamera } from "@guardian/src-icons";
import { Column, Columns } from "@guardian/src-layout";
import React, { useMemo } from "react";
import { Button } from "../../editorial-source-components/Button";
import { Error } from "../../editorial-source-components/Error";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type {
  FieldValidationErrors,
  ValidationError,
} from "../../plugin/elementSpec";
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

type Props = {
  fieldValues: FieldNameToValueMap<ReturnType<typeof createImageFields>>;
  errors: FieldValidationErrors;
  fields: FieldNameToField<ReturnType<typeof createImageFields>>;
};

type ImageViewProps = {
  onChange: SetMedia;
  errors: ValidationError[];
  field: CustomField<MainImageData, MainImageProps>;
};

const AltText = styled.span`
  margin-right: ${space[2]}px;
`;

export const ImageElementTestId = "ImageElement";

const htmlLength = (text: string) => {
  const el = document.createElement("div");
  el.innerHTML = text;
  return el.innerText.length;
};

export const ImageElementForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
  fieldValues,
}) => (
  <div data-cy={ImageElementTestId}>
    <Columns>
      <Column width={2 / 5}>
        <FieldLayoutVertical>
          <CustomDropdownView
            field={fields.role}
            label="Weighting"
            errors={errors.role}
          />
          <ImageView
            field={fields.mainImage}
            onChange={({ caption, source, photographer }) => {
              fields.caption.update(caption);
              fields.source.update(source);
              fields.photographer.update(photographer);
            }}
            errors={errors.mainImage}
          />
          <CustomDropdownView
            field={fields.imageType}
            label={"Image type"}
            errors={errors.imageType}
          />
        </FieldLayoutVertical>
      </Column>
      <Column width={3 / 5}>
        <FieldLayoutVertical>
          <FieldWrapper
            field={fields.caption}
            errors={errors.caption}
            label="Caption"
            description={`${htmlLength(fieldValues.caption)}/600 characters`}
          />
          <FieldWrapper
            field={fields.alt}
            errors={errors.alt}
            label={
              <>
                <AltText>Alt text</AltText>
                <Button
                  priority="secondary"
                  size="xsmall"
                  iconSide="left"
                  onClick={() => fields.alt.update(fieldValues.caption)}
                >
                  Copy from caption
                </Button>
              </>
            }
          />
          <Columns>
            <Column width={1 / 2}>
              <FieldWrapper
                field={fields.photographer}
                errors={errors.photographer}
                label="Photographer"
              />
            </Column>
            <Column width={1 / 2}>
              <FieldWrapper
                field={fields.source}
                errors={errors.source}
                label="Source"
              />
            </Column>
          </Columns>
          <CustomCheckboxView
            field={fields.displayCredit}
            errors={errors.displayCredit}
            label="Display credit information"
          />
        </FieldLayoutVertical>
      </Column>
    </Columns>
  </div>
);

const imageViewStysles = css`
  width: 100%;
`;

const Errors = ({ errors }: { errors: string[] }) =>
  !errors.length ? null : <Error>{errors.join(", ")}</Error>;

const ImageView = ({ field, onChange, errors }: ImageViewProps) => {
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

  const imageSrc = useMemo(() => {
    const desiredWidth = 1200;

    const widthDifference = (width: number) => Math.abs(desiredWidth - width);

    const stringOrNumberToNumber = (value: string | number) => {
      const parsedValue = parseInt(value.toString());
      return !isNaN(parsedValue) ? parsedValue : 0;
    };

    const sortByWidthDifference = (assetA: Asset, assetB: Asset) =>
      widthDifference(stringOrNumberToNumber(assetA.fields.width)) -
      widthDifference(stringOrNumberToNumber(assetB.fields.width));

    const sortedAssets = imageFields.assets
      .filter((asset) => !asset.fields.isMaster)
      .sort(sortByWidthDifference);

    return sortedAssets.length > 0 ? sortedAssets[0].url : undefined;
  }, [imageFields.assets]);

  return (
    <div>
      <Errors errors={errors.map((e) => e.error)} />
      <div>
        <img css={imageViewStysles} src={imageSrc} />
      </div>
      <Button
        priority="secondary"
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
    </div>
  );
};
