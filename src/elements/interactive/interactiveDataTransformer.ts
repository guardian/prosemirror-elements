import { pickBy } from "lodash";
import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { createInteractiveFields } from "./InteractiveSpec";

export type ExternalInteractiveFields = {
  html: string;
  isMandatory: string;
  scriptUrl: string;
  iframeUrl: string;
  originalUrl: string;
  scriptName: string;
  source: string;
  alt?: string;
  caption?: string;
  role: string | undefined;
};

export type ExternalInteractiveData = {
  fields: ExternalInteractiveFields;
  assets: [];
};

export type PartialInteractiveData = {
  fields: Partial<ExternalInteractiveFields>;
};

export const transformElementIn: TransformIn<
  PartialInteractiveData,
  ReturnType<typeof createInteractiveFields>
> = ({ fields }) => {
  const { isMandatory, role, ...rest } = fields;

  return {
    isMandatory: isMandatory === "true",
    role: role ?? undefinedDropdownValue,
    ...rest,
  };
};

export const transformElementOut: TransformOut<
  ExternalInteractiveData,
  ReturnType<typeof createInteractiveFields>
> = ({
  isMandatory,
  role,
  alt,
  caption,
  ...rest
}: FieldNameToValueMap<
  ReturnType<typeof createInteractiveFields>
>): ExternalInteractiveData => {
  const optionalFields = pickBy(
    {
      alt,
      caption,
    },
    (field) => field.length > 0
  );

  return {
    assets: [],
    fields: {
      isMandatory: isMandatory.toString(),
      role: role === undefinedDropdownValue ? undefined : role,
      ...optionalFields,
      ...rest,
    },
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
