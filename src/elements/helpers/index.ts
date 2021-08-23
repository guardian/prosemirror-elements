import type { ReactElement } from "react";
import type { Validator } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { Consumer } from "../../plugin/types/Consumer";
import type { FieldDescriptions } from "../../plugin/types/Element";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";

type FlexibleModelElement<FDesc extends FieldDescriptions<string>> = {
  fields: Omit<FieldNameToValueMap<FDesc>, "assets"> & { isMandatory: boolean };
  assets: Pick<FieldNameToValueMap<FDesc>, "assets">;
};

export const createGuElementSpec = <FDesc extends FieldDescriptions<string>>(
  FieldDescriptions: FDesc,
  consumer: Consumer<ReactElement, FDesc>,
  validate: Validator<FDesc>,
  isMandatory = true
) => {
  return createReactElementSpec(FieldDescriptions, consumer, validate, {
    transformElementDataIn: ({
      assets,
      fields,
    }: FlexibleModelElement<FDesc>) => {
      return { ...fields, assets } as FieldNameToValueMap<FDesc>;
    },
    transformElementDataOut: ({
      assets,
      ...fields
    }: FieldNameToValueMap<FDesc>) => {
      return {
        assets,
        fields: { ...fields, isMandatory },
      } as FlexibleModelElement<FDesc>;
    },
  });
};
