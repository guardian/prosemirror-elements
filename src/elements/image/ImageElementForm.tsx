import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { Column, Columns } from "@guardian/src-layout";
import React, { useContext, useEffect, useMemo } from "react";
import { Button } from "../../editorial-source-components/Button";
import { Error } from "../../editorial-source-components/Error";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { SvgCrop } from "../../editorial-source-components/SvgCrop";
import { Tooltip } from "../../editorial-source-components/Tooltip";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type {
  FieldValidationErrors,
  ValidationError,
} from "../../plugin/elementSpec";
import type { Options } from "../../plugin/fieldViews/DropdownFieldView";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { CustomField, FieldNameToField } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { Store } from "../../renderers/react/store";
import { TelemetryContext } from "../../renderers/react/TelemetryContext";
import { useCustomFieldState } from "../../renderers/react/useCustomFieldViewState";
import type { Asset } from "../helpers/defaultTransform";
import { htmlLength } from "../helpers/validation";
import type {
  createImageFields,
  ImageSelector,
  MainImageData,
  MediaPayload,
  SetMedia,
} from "./ImageElement";
import { minAssetValidation } from "./ImageElement";
import { ImageElementTelemetryType } from "./imageElementTelemetryEvents";

type Props = {
  fieldValues: FieldNameToValueMap<ReturnType<typeof createImageFields>>;
  errors: FieldValidationErrors;
  fields: FieldNameToField<ReturnType<typeof createImageFields>>;
  roleOptionsStore: Store<Options>;
};

type ImageViewProps = {
  updateFields: SetMedia;
  errors: ValidationError[];
  field: CustomField<MainImageData, { openImageSelector: ImageSelector }>;
};

const AltText = styled.span`
  margin-right: ${space[2]}px;
`;

export const ImageElementTestId = "ImageElement";

export const thumbnailOption = {
  text: "thumbnail",
  value: "thumbnail",
};

export const ImageElementForm: React.FunctionComponent<Props> = ({
  errors,
  fields,
  fieldValues,
  roleOptionsStore: RoleOptionsStore,
}) => {
  const sendTelemetryEvent = useContext(TelemetryContext);

  return (
    <div data-cy={ImageElementTestId}>
      <Columns>
        <Column width={2 / 5}>
          <FieldLayoutVertical>
            <RoleOptionsStore>
              {(additionalRoleOptions) => (
                <RoleOptionsDropdown
                  additionalRoleOptions={additionalRoleOptions}
                  field={fields.role}
                  fieldValue={fieldValues.role}
                  errors={errors.role}
                  mainImage={fieldValues.mainImage}
                />
              )}
            </RoleOptionsStore>
            <ImageView
              field={fields.mainImage}
              updateFields={({ caption, source, photographer }) => {
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
              headingLabel="Caption"
              description={`${htmlLength(fieldValues.caption)}/600 characters`}
            />
            <FieldWrapper
              field={fields.alt}
              errors={errors.alt}
              headingLabel={<AltText>Alt text</AltText>}
              headingContent={
                <>
                  <Tooltip>
                    <p>
                      ‘Alt text’ describes what’s in an image. It helps users of
                      screen readers understand our images, and improves our
                      SEO.
                    </p>
                    <p>
                      <a
                        href="https://docs.google.com/document/d/1oW542iCRyKfI4DS22QU7AH0TQRWLYMm7bTlhJlX5_Ng/edit?usp=sharing"
                        target="_blank"
                      >
                        Find out more
                      </a>
                    </p>
                  </Tooltip>
                  <Button
                    priority="secondary"
                    size="xsmall"
                    iconSide="left"
                    onClick={() => {
                      sendTelemetryEvent?.(
                        ImageElementTelemetryType.CopyFromCaptionButtonPressed
                      );
                      fields.alt.update(fieldValues.caption);
                    }}
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
                  headingLabel="Photographer"
                />
              </Column>
              <Column width={1 / 2}>
                <FieldWrapper
                  field={fields.source}
                  errors={errors.source}
                  headingLabel="Source"
                />
              </Column>
            </Columns>
            <Columns>
              <Column width={1 / 2}>
                <CustomCheckboxView
                  field={fields.displayCredit}
                  errors={errors.displayCredit}
                  label="Display credit information"
                />
              </Column>
            </Columns>
          </FieldLayoutVertical>
        </Column>
      </Columns>
    </div>
  );
};

const thumbnailOnlyOptions = [thumbnailOption];

const RoleOptionsDropdown = ({
  field,
  fieldValue,
  mainImage,
  additionalRoleOptions,
  errors,
}: {
  field: CustomField<string, Options>;
  additionalRoleOptions: Options;
  mainImage: MainImageData;
  fieldValue: string;
  errors: ValidationError[];
}) => {
  // We memoise these options to ensure that this array does not change identity
  // and re-trigger useEffect unless our additionalRoleOptions have changed.
  const allOptions = useMemo(
    () => [...additionalRoleOptions, thumbnailOption],
    [additionalRoleOptions]
  );

  const roleOptions = minAssetValidation(mainImage, "").length
    ? thumbnailOnlyOptions
    : allOptions;

  /**
   * We must check our role when our role options change, to
   * ensure that the value we've selected exists within our list
   * of options. If it doesn't, we update our field value to the
   * first available option.
   */
  useEffect(() => {
    if (!fieldValue) {
      return;
    }

    const roleHasBeenRemoved = !roleOptions.some(
      ({ value }) => fieldValue === value
    );

    if (roleHasBeenRemoved) {
      const firstAvailableOption = roleOptions[0].value;
      field.update(firstAvailableOption);
    }
  }, [roleOptions]);

  return (
    <CustomDropdownView
      field={field}
      label="Weighting"
      errors={errors}
      options={roleOptions}
    />
  );
};

const imageViewStyles = css`
  width: 100%;
`;

const Errors = ({ errors }: { errors: string[] }) =>
  !errors.length ? null : <Error>{errors.join(", ")}</Error>;

const ImageView = ({ field, updateFields, errors }: ImageViewProps) => {
  const [imageFields, setImageFields] = useCustomFieldState(field);

  const sendTelemetryEvent = useContext(TelemetryContext);

  const setMedia = (previousMediaId: string | undefined) => (
    mediaPayload: MediaPayload
  ) => {
    const { mediaId, mediaApiUri, assets, suppliersReference } = mediaPayload;
    setImageFields({
      mediaId,
      mediaApiUri,
      assets,
      suppliersReference,
    });

    if (previousMediaId && previousMediaId !== mediaId) {
      updateFields(mediaPayload);
    }
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
        <img css={imageViewStyles} src={imageSrc} />
      </div>
      <Button
        priority="secondary"
        size="xsmall"
        icon={<SvgCrop />}
        iconSide="left"
        onClick={() => {
          sendTelemetryEvent?.(ImageElementTelemetryType.CropButtonPressed);
          field.description.props.openImageSelector(
            setMedia(imageFields.mediaId),
            imageFields.mediaId
          );
        }}
      >
        Re-crop image
      </Button>
    </div>
  );
};
