import { Column, Columns } from "@guardian/src-layout";
import type { FunctionComponent } from "react";
import React, { useMemo, useState } from "react";
import { Button } from "../../editorial-source-components/Button";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { Label } from "../../editorial-source-components/Label";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { getImageSrc } from "../helpers/getImageSrc";
import type { MainImageData, MediaPayload } from "../image/ImageElement";
import { cartoonFields } from "./CartoonSpec";

export const cartoonElement = createReactElementSpec(
  cartoonFields,
  ({ fields }) => {
    const [desktopImages, setDesktopImages] = useState<MainImageData[]>(
      fields.desktopImages.value
    );
    const [mobileImages, setMobileImages] = useState<MainImageData[]>(
      fields.mobileImages.value
    );

    return (
      <>
        <Label>Cartoon</Label>
        <Columns>
          <Column width={1 / 3}>
            <FieldLayoutVertical>
              <Label>Desktop View</Label>
              {desktopImages.map((image) => (
                <ImageThumbnail image={image} altText={fields.alt.value} />
              ))}
              <Button
                priority="secondary"
                size="xsmall"
                onClick={() => {
                  fields.desktopImages.description.props.openImageSelector(
                    (mediaPayload: MediaPayload) => {
                      fields.desktopImages.update([
                        ...desktopImages,
                        mediaPayload,
                      ]);
                      setDesktopImages([...desktopImages, mediaPayload]);
                    }
                  );
                }}
              >
                Add image
              </Button>
            </FieldLayoutVertical>
          </Column>
          <Column width={1 / 3}>
            <FieldLayoutVertical>
              <Label>Mobile View</Label>
              {mobileImages.map((image) => (
                <ImageThumbnail image={image} altText={fields.alt.value} />
              ))}
              <Button
                priority="secondary"
                size="xsmall"
                onClick={() => {
                  fields.desktopImages.description.props.openImageSelector(
                    (mediaPayload: MediaPayload) => {
                      fields.mobileImages.update([
                        ...mobileImages,
                        mediaPayload,
                      ]);
                      setMobileImages([...mobileImages, mediaPayload]);
                    }
                  );
                }}
              >
                Add image
              </Button>
            </FieldLayoutVertical>
          </Column>

          <Column width={1 / 3}>
            <FieldLayoutVertical>
              <CustomDropdownView
                field={fields.role}
                label="Weighting"
                display="inline"
              />
              <FieldWrapper field={fields.credit} headingLabel="Comic credit" />
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
                headingLabel="Default alt text"
              />
            </FieldLayoutVertical>
          </Column>
        </Columns>
      </>
    );
  }
);

const ImageThumbnail: FunctionComponent<{
  image: MainImageData;
  altText: string;
}> = ({ image, altText }) => {
  return (
    <img
      src={useMemo(() => getImageSrc(image.assets, 1200), [image.assets])}
      alt={altText}
    ></img>
  );
};
