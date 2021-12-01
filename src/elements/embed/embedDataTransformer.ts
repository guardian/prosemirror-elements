import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import { undefinedDropdownValue } from "./EmbedSpec";
import type { createEmbedFields } from "./EmbedSpec";

export type ExternalEmbedFields = {
  alt: string;
  caption: string;
  html: string;
  isMandatory: string;
  url: string;
  role: string | undefined;
};

export type ExternalEmbedData = {
  fields: ExternalEmbedFields;
};

export type PartialEmbedData = {
  fields: Partial<ExternalEmbedFields>;
};

export const transformElementIn: TransformIn<
  PartialEmbedData,
  ReturnType<typeof createEmbedFields>
> = ({ fields }) => {
  const { alt, caption, html, isMandatory, url, role } = fields;

  return {
    alt,
    caption,
    html,
    isMandatory: isMandatory === "true",
    url,
    role: role ?? undefinedDropdownValue,
  };
};

export const transformElementOut: TransformOut<
  ExternalEmbedData,
  ReturnType<typeof createEmbedFields>
> = ({
  alt,
  caption,
  html,
  isMandatory,
  url,
  role,
}: FieldNameToValueMap<
  ReturnType<typeof createEmbedFields>
>): ExternalEmbedData => {
  return {
    fields: {
      alt,
      caption,
      html,
      isMandatory: isMandatory.toString(),
      url,
      role: role === undefinedDropdownValue ? undefined : role,
    },
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
