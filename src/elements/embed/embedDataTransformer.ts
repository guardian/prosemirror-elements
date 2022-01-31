import pickBy from "lodash/pickBy";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import { isHtmlSafe } from "../helpers/html";
import { undefinedDropdownValue } from "../helpers/transform";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { createEmbedFields } from "./EmbedSpec";

export type ExternalEmbedFields = {
  alt?: string;
  caption?: string;
  html: string;
  isMandatory: string;
  url?: string;
  role: string | undefined;
  isSafe: string;
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
  const optionalFields = pickBy(
    {
      alt,
      caption,
      url,
    },
    (field) => field.length > 0
  );

  const isSafe = isHtmlSafe(html);

  return {
    fields: {
      html,
      isMandatory: isMandatory.toString(),
      isSafe: isSafe.toString(),
      role: role === undefinedDropdownValue ? undefined : role,
      ...optionalFields,
    },
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
