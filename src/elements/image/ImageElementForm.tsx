import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { brand, neutral, space } from "@guardian/src-foundations";
import { SvgCamera, SvgInfo } from "@guardian/src-icons";
import { Column, Columns } from "@guardian/src-layout";
import React, { useMemo, useState } from "react";
import { usePopper } from "react-popper";
import { Button } from "../../editorial-source-components/Button";
import { Error } from "../../editorial-source-components/Error";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type {
  FieldValidationErrors,
  ValidationError,
} from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
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
import { minAssetValidation, thumbnailOption } from "./ImageElement";

type Props = {
  fieldValues: FieldNameToValueMap<ReturnType<typeof createImageFields>>;
  errors: FieldValidationErrors;
  fields: FieldNameToField<ReturnType<typeof createImageFields>>;
};

type ImageViewProps = {
  updateFields: SetMedia;
  updateRole: (value: string) => void;
  errors: ValidationError[];
  field: CustomField<MainImageData, MainImageProps>;
};

const AltText = styled.span`
  margin-right: ${space[2]}px;
`;

const infoIcon = css`
  height: 22px;
  width: 22px;
  margin-right: 4px;
  margin-left: -4px;
  svg {
    margin: -1px;
  }
  :hover {
    cursor: pointer;
  }
`;

const tooltip = css`
  font-family: "Guardian Agate Sans";
  background-color: ${neutral[10]};
  color: ${neutral[97]};
  width: 300px;
  font-weight: 300;
  border-radius: 4px;
  line-height: 1.2rem;
  font-family: "Guardian Agate Sans";
  filter: drop-shadow(0 2px 4px rgb(0 0 0 / 30%));
  z-index: 1;
  p {
    margin: 10px;
  }
  a {
    color: ${brand[800]};
  }
  opacity: 0;
  transition: opacity 0.3s;
  /* transition: visibility 0.3s; */
  transition: visibility 0s;
  transition-delay: visibility 0s;

  visibility: hidden;
  &[data-show] {
    transition-delay: visibility 1s;
    transition-delay: transition-delay 1s;
    visibility: visible;
    opacity: 1;
  }
  [data-popper-reference-hidden] {
    visibility: hidden;
    pointer-events: none;
  }
`;

const arrow = css`
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  visibility: hidden;
  &[data-show] {
    ::before {
      visibility: visible;
    }
  }
  &[data-popper-reference-hidden] {
    ::before {
      visibility: hidden;
      pointer-events: none;
    }
  }
  ::before {
    position: absolute;
    width: 8px;
    height: 8px;
    background: inherit;
    content: "";
    transform: translate(0px, -4px) rotate(45deg);
  }
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
}) => {
  const [
    referenceElement,
    setReferenceElement,
  ] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes, update } = usePopper(
    referenceElement,
    popperElement,
    {
      placement: "top",
      modifiers: [
        { name: "arrow", options: { element: arrowElement } },
        {
          name: "offset",
          options: {
            offset: [0, 4],
          },
        },
      ],
    }
  );
  return (
    <div data-cy={ImageElementTestId}>
      <Columns>
        <Column width={2 / 5}>
          <FieldLayoutVertical>
            <CustomDropdownView
              field={fields.role}
              label="Weighting"
              errors={errors.role}
              options={
                minAssetValidation(fieldValues.mainImage, "").length
                  ? [thumbnailOption]
                  : undefined
              }
            />
            <ImageView
              field={fields.mainImage}
              updateFields={({ caption, source, photographer }) => {
                fields.caption.update(caption);
                fields.source.update(source);
                fields.photographer.update(photographer);
              }}
              updateRole={(value) => fields.role.update(value)}
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
                  <div
                    css={infoIcon}
                    ref={setReferenceElement}
                    onMouseOver={() => {
                      setTooltipVisible(true);
                      if (update) void update();
                    }}
                    onMouseLeave={() => {
                      setTooltipVisible(false);
                      if (update) void update();
                    }}
                  >
                    <SvgInfo />
                  </div>

                  <div
                    ref={setPopperElement}
                    style={styles.popper}
                    css={tooltip}
                    data-show={tooltipVisible ? tooltipVisible : null}
                    {...attributes.popper}
                    onMouseOver={() => {
                      setTooltipVisible(true);
                      if (update) void update();
                    }}
                    onMouseLeave={() => {
                      setTooltipVisible(false);
                      if (update) void update();
                    }}
                  >
                    <p>
                      'Alt text' describes what's in an image. It helps users of
                      screen readers understand our images, and improves our
                      SEO.
                    </p>
                    <p>
                      <a href="https://example.com">Find out more</a>
                    </p>

                    <div
                      ref={setArrowElement}
                      style={styles.arrow}
                      css={arrow}
                      data-show={tooltipVisible ? tooltipVisible : null}
                    />
                  </div>
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

const imageViewStyles = css`
  width: 100%;
`;

const Errors = ({ errors }: { errors: string[] }) =>
  !errors.length ? null : <Error>{errors.join(", ")}</Error>;

const ImageView = ({
  field,
  updateFields,
  updateRole,
  errors,
}: ImageViewProps) => {
  const [imageFields, setImageFields] = useCustomFieldState(field);

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
    if (minAssetValidation({ assets }, "").length) {
      updateRole(thumbnailOption.value);
    }
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
        icon={<SvgCamera />}
        iconSide="left"
        onClick={() => {
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
