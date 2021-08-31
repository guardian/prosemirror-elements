import type { ReactElement } from "react";
import type { Validator } from "../plugin/elementSpec";
import type { FieldNameToValueMap } from "../plugin/fieldViews/helpers";
import type { Consumer } from "../plugin/types/Consumer";
import type { FieldDescriptions } from "../plugin/types/Element";
import { createReactElementSpec } from "../renderers/react/createReactElementSpec";

type FlexibleModelElement<FDesc extends FieldDescriptions<string>> = {
  fields: Omit<FieldNameToValueMap<FDesc>, "assets"> & {
    isMandatory?: boolean;
  };
  assets: string[];
};

/**
 * Creates an element that is rendered by React, and transforms its data
 * into a format compatible with flexible-model. See the model at
 * https://github.com/guardian/flexible-model/blob/main/src/main/thrift/content.thrift
 */
export const createGuElementSpec = <FDesc extends FieldDescriptions<string>>(
  FieldDescriptions: FDesc,
  consumer: Consumer<ReactElement, FDesc>,
  validate: Validator<FDesc>,
  isMandatory?: boolean
) => {
  return createReactElementSpec(FieldDescriptions, consumer, validate, {
    transformElementDataIn: ({
      assets = [],
      fields,
    }: FlexibleModelElement<FDesc>) => {
      return ({ ...fields, assets } as unknown) as FieldNameToValueMap<FDesc>;
    },
    transformElementDataOut: ({
      assets,
      ...fields
    }: FieldNameToValueMap<FDesc>) => {
      const baseFields = {
        assets: assets || [],
        fields: { ...fields },
      } as FlexibleModelElement<FDesc>;

      if (isMandatory === undefined) {
        return baseFields;
      }

      return {
        ...baseFields,
        fields: { ...fields, isMandatory },
      };
    },
  });
};
