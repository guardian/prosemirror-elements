import type { Asset } from "../helpers/defaultTransform";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type {
  createFormFields,
  ExtraFormData,
  FormData,
} from "./FormElementSpec";

export interface ExternalFormData {
  fields: FormData & ExtraFormData;
  assets: Asset[];
}

export const transformElementIn: TransformIn<
  ExternalFormData,
  ReturnType<typeof createFormFields>
> = ({
  fields: { id, html, originalUrl, isMandatory, signedOutAltText, ...rest },
}) => ({
  id,
  html,
  originalUrl,
  isMandatory,
  signedOutAltText,
  data: JSON.stringify(rest),
});

export const transformElementOut: TransformOut<
  ExternalFormData,
  ReturnType<typeof createFormFields>
> = ({ id, html, originalUrl, isMandatory, signedOutAltText, data }) => {
  return {
    fields: {
      id,
      html,
      originalUrl,
      isMandatory,
      signedOutAltText,
      ...(JSON.parse(data) as ExtraFormData),
    },
    assets: [],
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
