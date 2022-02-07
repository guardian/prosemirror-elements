import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import { undefinedDropdownValue } from "../helpers/transform";
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
  ...rest
}: FieldNameToValueMap<
  ReturnType<typeof createInteractiveFields>
>): ExternalInteractiveData => {
  return {
    fields: {
      isMandatory: isMandatory.toString(),
      role: role === undefinedDropdownValue ? undefined : role,
      ...rest,
    },
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
