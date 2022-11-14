import { Column, Columns } from "@guardian/src-layout";
import React, { useMemo, useState } from "react";
import { Button } from "../../editorial-source-components/Button";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { Label } from "../../editorial-source-components/Label";
import { SvgCrop } from "../../editorial-source-components/SvgCrop";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { getImageSrc } from "../helpers/getImageSrc";
import type { MainImageData, MediaPayload } from "../image/ImageElement";
import { cartoonFields } from "./CartoonSpec";

export const cartoonElement = createReactElementSpec(
  cartoonFields,
  ({ fields }) => {
    const [image, setImage] = useState<MainImageData>(fields.mainImage.value);

    const imageSrc = useMemo(() => getImageSrc(image.assets, 1200), [
      image.assets,
    ]);

    return (
      <div>
        <Columns>
          <Column width={2 / 3}>
            <FieldLayoutVertical>
              <Label>Cartoon</Label>
              <img src={imageSrc} alt={fields.alt.value}></img>
              <Button
                priority="secondary"
                size="xsmall"
                icon={<SvgCrop />}
                iconSide="left"
                onClick={() => {
                  fields.mainImage.description.props.openImageSelector(
                    (mediaPayload: MediaPayload) => setImage(mediaPayload),
                    image.mediaId
                  );
                }}
              >
                Re-crop image
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
              <FieldWrapper field={fields.alt} headingLabel="Alt text" />
            </FieldLayoutVertical>
          </Column>
        </Columns>
      </div>
    );
  }
);
