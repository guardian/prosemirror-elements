import type { Asset } from "../helpers/defaultTransform";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { fields } from "./DeprecatedSpec";

export interface ExternalDeprecatedFields extends Data {
  elementType: string;
}

interface Data {
  fields: Record<string, unknown>;
  assets: Asset[];
}

export const transformElementIn: TransformIn<
  ExternalDeprecatedFields,
  typeof fields
> = ({ fields, assets, elementType }) => ({
  data: JSON.stringify({ fields, assets }),
  type: elementType,
});

export const transformElementOut: TransformOut<
  Omit<ExternalDeprecatedFields, "elementType">,
  typeof fields
> = ({ data }) => ({
  ...(JSON.parse(data) as Data),
});

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
