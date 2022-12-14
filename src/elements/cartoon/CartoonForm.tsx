import { css } from "@emotion/react";
import { neutral } from "@guardian/src-foundations";
import { iconSize } from "@guardian/src-foundations/size";
import { Column, Columns } from "@guardian/src-layout";
import type { FunctionComponent } from "react";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../../editorial-source-components/Button";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { Label } from "../../editorial-source-components/Label";
import { Tooltip } from "../../editorial-source-components/Tooltip";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { getImageSrc } from "../helpers/getImageSrc";
import type {
  ImageSelector,
  MainImageData,
  MediaPayload,
} from "../image/ImageElement";
import { AltText } from "../image/ImageElementForm";
import { cartoonFields } from "./CartoonSpec";

export const cartoonElement = (onCropImage: ImageSelector) => {
  return createReactElementSpec(cartoonFields(onCropImage), ({ fields }) => {
    const [desktopImages, setDesktopImages] = useState<MainImageData[]>(
      fields.desktopImages.value
    );
    const [mobileImages, setMobileImages] = useState<MainImageData[]>(
      fields.mobileImages.value
    );

    useEffect(() => {
      fields.desktopImages.update(desktopImages);
    }, [desktopImages]);

    useEffect(() => {
      fields.mobileImages.update(mobileImages);
    }, [mobileImages]);

    return (
      <>
        <Label>Cartoon</Label>
        <Columns>
          <Column width={1 / 3}>
            <FieldLayoutVertical>
              <ImageSet
                title={"Desktop view"}
                images={desktopImages}
                defaultAltText={fields.alt.value}
                addImage={() => {
                  fields.desktopImages.description.props.openImageSelector(
                    (mediaPayload: MediaPayload) =>
                      setDesktopImages([...desktopImages, mediaPayload]),
                    desktopImages[0]?.mediaId
                  );
                }}
                removeImage={(index) => {
                  setDesktopImages(desktopImages.filter((_, i) => i !== index));
                }}
                required={true}
              />
            </FieldLayoutVertical>
          </Column>
          <Column width={1 / 3}>
            <FieldLayoutVertical>
              <ImageSet
                title={"Mobile view"}
                images={mobileImages}
                defaultAltText={fields.alt.value}
                addImage={() => {
                  fields.mobileImages.description.props.openImageSelector(
                    (mediaPayload: MediaPayload) =>
                      setMobileImages([...mobileImages, mediaPayload]),
                    desktopImages[0]?.mediaId
                  );
                }}
                removeImage={(index) => {
                  setMobileImages(mobileImages.filter((_, i) => i !== index));
                }}
              />
            </FieldLayoutVertical>
          </Column>

          <Column width={1 / 3}>
            <FieldLayoutVertical>
              <CustomDropdownView
                field={fields.role}
                label="Weighting"
                display="block"
              />
              <FieldWrapper field={fields.credit} headingLabel="Comic by" />
              <FieldWrapper field={fields.source} headingLabel="Source" />
              <FieldWrapper
                field={fields.verticalPadding}
                headingLabel="Vertical padding"
              />
              <FieldWrapper
                field={fields.backgroundColour}
                headingLabel="Background colour"
              />
              <FieldWrapper
                field={fields.alt}
                headingLabel={<AltText>Alt text</AltText>}
                headingContent={
                  <>
                    <Tooltip>
                      <p>
                        ‘Alt text’ describes what’s in an image. It helps users
                        of screen readers understand our images, and improves
                        our SEO.
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
                  </>
                }
              />
            </FieldLayoutVertical>
          </Column>
        </Columns>
      </>
    );
  });
};

const ImageSet: FunctionComponent<{
  title: string;
  images: MainImageData[];
  defaultAltText: string;
  addImage: () => void;
  removeImage: (index: number) => void;
  required?: boolean;
}> = ({
  title,
  images,
  defaultAltText,
  addImage,
  removeImage,
  required = false,
}) => {
  return (
    <>
      <Label>{title}</Label>
      {images.map((image, index) => (
        <ImageThumbnail
          key={index}
          index={index}
          image={image}
          altText={defaultAltText}
          removeImage={removeImage}
          required={required && index === 0}
        />
      ))}
      <Button priority="secondary" size="xsmall" onClick={() => addImage()}>
        Add image
      </Button>
    </>
  );
};

const imageThumbnailStyle = css`
  position: relative;
  width: 150px;
  height: 150px;
  background-color: #ccc;
  button {
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
  }
  img {
    position: absolute;
    max-width: 100%;
    max-height: 100%;
    inset: 0;
    margin: auto;
  }
`;

const ImageThumbnail: FunctionComponent<{
  index: number;
  image: MainImageData;
  altText: string;
  removeImage: (index: number) => void;
  required: boolean;
}> = ({ index, image, altText, removeImage, required }) => {
  return (
    <div css={imageThumbnailStyle}>
      {!required && (
        <button
          role="button"
          aria-label={"Remove Image"}
          onClick={() => removeImage(index)}
        >
          <SvgCrossRound />
        </button>
      )}
      <img
        src={useMemo(() => getImageSrc(image.assets, 1200), [image.assets])}
        alt={altText}
      ></img>
    </div>
  );
};

const SvgCrossRound: FunctionComponent = () => (
  <svg
    width={iconSize["small"]}
    viewBox="-3 -3 30 30"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm5.138-14.358-.782-.78-4.349 3.982-4.364-3.967-.782.78L10.85 12l-3.988 4.342.782.781 4.364-3.967 4.35 3.982.781-.78L13.165 12l3.973-4.358Z"
    />
  </svg>
);
