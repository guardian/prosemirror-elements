import { css } from "@emotion/react";
import { neutral, space } from "@guardian/src-foundations";
import { Column, Columns } from "@guardian/src-layout";
import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import type { FunctionComponent } from "react";
import React from "react";
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
import type { CartoonImageSelector, Image } from "../helpers/types/Media";
import { cartoonFields } from "./CartoonSpec";

export const createCartoonElement = (
  cartoonImageSelector: CartoonImageSelector,
  createCaptionPlugins: (schema: Schema) => Plugin[]
) => {
  return createReactElementSpec(
    cartoonFields(cartoonImageSelector, createCaptionPlugins),
    ({ fields }) => {
      const addImageAtIndex = (
        imageToInsert: Image,
        images: Image[],
        index?: number
      ) => {
        if (index !== undefined && index > -1 && index < images.length) {
          return images.map((image, i) => {
            if (i === index) {
              return imageToInsert;
            } else {
              return image;
            }
          });
        } else {
          return [...images, imageToInsert];
        }
      };

      return (
        <FieldLayoutVertical>
          <ImageSet
            label={"Desktop images (default)"}
            images={fields.largeImages.value}
            alt={fields.alt.value}
            addImage={(mediaId?: string, index?: number) => {
              fields.largeImages.description.props.cartoonImageSelector(
                (imageToInsert: Image) =>
                  fields.largeImages.update(
                    addImageAtIndex(
                      imageToInsert,
                      fields.largeImages.value,
                      index
                    )
                  ),
                mediaId
              );
            }}
            removeImage={(index) => {
              fields.largeImages.update(
                fields.largeImages.value.filter((_, i) => i !== index)
              );
            }}
            required={true}
            mainMediaId={fields.largeImages.value[0]?.mediaId}
          />
          <ImageSet
            label={"Mobile images"}
            images={fields.smallImages.value}
            alt={fields.alt.value}
            addImage={(mediaId?: string, index?: number) => {
              fields.smallImages.description.props.cartoonImageSelector(
                (imageToInsert: Image) =>
                  fields.smallImages.update(
                    addImageAtIndex(
                      imageToInsert,
                      fields.smallImages.value,
                      index
                    )
                  ),
                mediaId
              );
            }}
            removeImage={(index) => {
              fields.smallImages.update(
                fields.smallImages.value.filter((_, i) => i !== index)
              );
            }}
            mainMediaId={fields.largeImages.value[0]?.mediaId}
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
            <Column width={1 / 3}>
              <FieldWrapper
                field={fields.photographer}
                headingLabel={"Byline"}
              />
            </Column>
            <Column width={1 / 3}>
              <FieldWrapper field={fields.source} headingLabel={"Source"} />
            </Column>
            <Column width={1 / 3}>
              <CustomDropdownView
                field={fields.role}
                label="Weighting"
                display={"block"}
              />
            </Column>
          </Columns>
          <Columns>
            <Column width={2 / 3}>
              <CustomCheckboxView
                field={fields.displayCredit}
                label="Display credit information"
              />
            </Column>
            <Column width={1 / 3}>
              <CustomDropdownView
                field={fields.imageType}
                label={"Image type"}
              ></CustomDropdownView>
            </Column>
          </Columns>
        </FieldLayoutVertical>
      );
    }
  );
};

const ImageSet: FunctionComponent<{
  label: string;
  images: Image[];
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
            key={`${image.file}-${index}`}
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
  image: Image;
  alt: string;
  recropImage: (mediaId?: string, index?: number) => void;
  removeImage: (index: number) => void;
  required: boolean;
}> = ({ index, image, alt, recropImage, removeImage, required }) => {
  return (
    <div>
      <div css={imageThumbnailStyle}>
        <img src={image.file} alt={alt}></img>
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
