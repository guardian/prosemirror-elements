import { css } from "@emotion/react";
import { neutral, space } from "@guardian/src-foundations";
import { Column, Columns } from "@guardian/src-layout";
import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import type { FunctionComponent } from "react";
import React, { useMemo } from "react";
import { Button } from "../../editorial-source-components/Button";
import {
  FieldLayoutHorizontal,
  FieldLayoutVertical,
} from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { InputHeading } from "../../editorial-source-components/InputHeading";
import { SvgCrop } from "../../editorial-source-components/SvgCrop";
import { SvgCrossRound } from "../../editorial-source-components/SvgCrossRound";
import { Tooltip } from "../../editorial-source-components/Tooltip";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { getImageSrc } from "../helpers/getImageSrc";
import type {
  ImageSelector,
  MainImageData,
  MediaPayload,
} from "../helpers/types/Media";
import { cartoonFields } from "./CartoonSpec";

export const cartoonElement = (
  imageSelector: ImageSelector,
  createCaptionPlugins: (schema: Schema) => Plugin[]
) => {
  return createReactElementSpec(
    cartoonFields(imageSelector, createCaptionPlugins),
    ({ fields }) => {
      const addImageAtIndex = (
        mediaPayload: MediaPayload,
        images: MainImageData[],
        index?: number
      ) => {
        if (index !== undefined && index > -1 && index < images.length) {
          return images.map((image, i) => {
            if (i === index) {
              return mediaPayload;
            } else {
              return image;
            }
          });
        } else {
          return [...images, mediaPayload];
        }
      };

      return (
        <FieldLayoutVertical>
          <ImageSet
            label={"Desktop images (default)"}
            images={fields.desktopImages.value}
            alt={fields.alt.value}
            addImage={(mediaId?: string, index?: number) => {
              fields.desktopImages.description.props.imageSelector(
                (mediaPayload: MediaPayload) =>
                  fields.desktopImages.update(
                    addImageAtIndex(
                      mediaPayload,
                      fields.desktopImages.value,
                      index
                    )
                  ),
                mediaId
              );
            }}
            removeImage={(index) => {
              fields.desktopImages.update(
                fields.desktopImages.value.filter((_, i) => i !== index)
              );
            }}
            required={true}
            mainMediaId={fields.desktopImages.value[0]?.mediaId}
          />
          <ImageSet
            label={"Mobile images"}
            images={fields.mobileImages.value}
            alt={fields.alt.value}
            addImage={(mediaId?: string, index?: number) => {
              fields.mobileImages.description.props.imageSelector(
                (mediaPayload: MediaPayload) =>
                  fields.mobileImages.update(
                    addImageAtIndex(
                      mediaPayload,
                      fields.mobileImages.value,
                      index
                    )
                  ),
                mediaId
              );
            }}
            removeImage={(index) => {
              fields.mobileImages.update(
                fields.mobileImages.value.filter((_, i) => i !== index)
              );
            }}
            mainMediaId={fields.desktopImages.value[0]?.mediaId}
          />
          <FieldWrapper field={fields.caption} headingLabel="Caption" />
          <FieldWrapper
            field={fields.alt}
            headingLabel={
              <span
                css={css`
                  margin-right: ${space[2]}px;
                `}
              >
                Alt text
              </span>
            }
            headingContent={
              <>
                <Tooltip>
                  <p>
                    ‘Alt text’ describes what’s in an image. It helps users of
                    screen readers understand our images, and improves our SEO.
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
                    fields.alt.update(fields.caption.value);
                  }}
                >
                  Copy from caption
                </Button>
              </>
            }
          />
          <Columns>
            <Column width={1 / 2}>
              <FieldLayoutVertical>
                <FieldWrapper
                  field={fields.credit}
                  headingLabel={"Comic credit"}
                />
                <CustomCheckboxView
                  field={fields.displayCredit}
                  label="Display credit information"
                />
              </FieldLayoutVertical>
            </Column>
            <Column width={1 / 2}>
              <FieldWrapper field={fields.source} headingLabel={"Source"} />
            </Column>
          </Columns>
          <Columns>
            <Column width={1 / 3}>
              <CustomDropdownView
                field={fields.role}
                label="Weighting"
                display={"block"}
              />
            </Column>
            <Column width={1 / 3}>
              <FieldWrapper
                field={fields.verticalPadding}
                headingLabel={"Vertical padding"}
              />
            </Column>
            <Column width={1 / 3}>
              <FieldWrapper
                field={fields.backgroundColour}
                headingLabel={"Background colour"}
              />
            </Column>
          </Columns>
        </FieldLayoutVertical>
      );
    }
  );
};

const ImageSet: FunctionComponent<{
  label: string;
  images: MainImageData[];
  alt: string;
  addImage: (mediaId?: string, index?: number) => void;
  removeImage: (index: number) => void;
  required?: boolean;
  mainMediaId?: string;
}> = ({
  label,
  images,
  alt,
  addImage,
  removeImage,
  required = false,
  mainMediaId,
}) => {
  return (
    <div>
      <InputHeading headingLabel={label} />
      <FieldLayoutHorizontal>
        {images.map((image, index) => (
          <ImageThumbnail
            index={index}
            image={image}
            alt={alt}
            recropImage={addImage}
            removeImage={removeImage}
            required={required && index === 0}
          />
        ))}
        <Button
          priority="secondary"
          size="xsmall"
          onClick={() => addImage(mainMediaId)}
        >
          {`Add ${images.length > 0 ? "another" : "an"} image`}
        </Button>
      </FieldLayoutHorizontal>
    </div>
  );
};

const imageThumbnailStyle = css`
  position: relative;
  width: 150px;
  height: 150px;
  background-color: #ccc;
  img {
    position: absolute;
    max-width: 100%;
    max-height: 100%;
    inset: 0;
    margin: auto;
  }
`;

const removeImageButton = css`
  position: absolute;
  top: -10px;
  right: -10px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  svg {
    fill: ${neutral[20]};
  }
  :hover svg {
    fill: ${neutral[60]};
  }
`;

const ImageThumbnail: FunctionComponent<{
  index: number;
  image: MainImageData;
  alt: string;
  recropImage: (mediaId?: string, index?: number) => void;
  removeImage: (index: number) => void;
  required: boolean;
}> = ({ index, image, alt, recropImage, removeImage, required }) => {
  return (
    <div>
      <div css={imageThumbnailStyle}>
        {!required && (
          <button
            css={removeImageButton}
            role="button"
            aria-label={"Remove Image"}
            onClick={() => removeImage(index)}
          >
            <SvgCrossRound />
          </button>
        )}
        <img
          src={useMemo(() => getImageSrc(image.assets, 1200), [image.assets])}
          alt={alt}
        ></img>
      </div>
      {required && (
        <Button
          css={css`
            margin-top: ${space[2]}px;
          `}
          priority="secondary"
          size="xsmall"
          icon={<SvgCrop />}
          iconSide="left"
          onClick={() => {
            recropImage(image.mediaId, index);
          }}
        >
          Re-crop image
        </Button>
      )}
    </div>
  );
};
