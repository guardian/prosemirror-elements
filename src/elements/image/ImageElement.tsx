import React from "react";
import { Label } from "../../editorial-source-components/Label";
import { TextInput } from "../../editorial-source-components/TextInput";
import type { FieldNameToValueMap } from "../../fieldViews/helpers";
import { getPropViewTestId, PropView } from "../../renderers/react/PropView";
import { useCustomFieldViewState } from "../../renderers/react/useCustomFieldViewState";
import type {
  CustomFieldViewSpec,
  FieldNameToFieldViewSpec,
} from "../../types/Element";
import type { imageProps } from "./element";

type Props = {
  fields: FieldNameToValueMap<typeof imageProps>;
  errors: Record<string, string[]>;
  fieldViewPropMap: FieldNameToFieldViewSpec<typeof imageProps>;
};

export const ImageElementTestId = "ImageElement";

export const ImageElement: React.FunctionComponent<Props> = ({
  fields,
  errors,
  fieldViewPropMap,
}) => (
  <div data-cy={ImageElementTestId}>
    <PropView fieldViewProp={fieldViewPropMap.altText} />
    <PropView fieldViewProp={fieldViewPropMap.caption} />
    <PropView fieldViewProp={fieldViewPropMap.src} />
    <PropView fieldViewProp={fieldViewPropMap.useSrc} />
    <PropView fieldViewProp={fieldViewPropMap.optionDropdown} />
    <ImageView fieldViewProp={fieldViewPropMap.mainImage} />
    <hr />
    <Label>Element errors</Label>
    <pre>{JSON.stringify(errors)}</pre>
    <hr />
    <Label>Element values</Label>
    <pre>{JSON.stringify(fields)}</pre>
  </div>
);

type ImageViewProps = {
  fieldViewProp: CustomFieldViewSpec<{
    src: string;
  }>;
};

const ImageView = ({ fieldViewProp }: ImageViewProps) => {
  const [imageFields, setImageFieldsRef] = useCustomFieldViewState(
    fieldViewProp
  );
  return (
    <div data-cy={getPropViewTestId(fieldViewProp.name)}>
      <Label>{fieldViewProp.name}</Label>
      <TextInput
        label={fieldViewProp.name}
        value={imageFields.src || ""}
        onChange={(e) => setImageFieldsRef.current?.({ src: e.target.value })}
      ></TextInput>
    </div>
  );
};
