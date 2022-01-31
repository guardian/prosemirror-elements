import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import { undefinedDropdownValue } from "../helpers/transform";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { createInteractiveFields } from "./InteractiveSpec";

export type ExternalInteractiveFields = {
  alt: string;
  caption: string;
  html: string;
  isMandatory: string;
  role: string | undefined;
  scriptUrl: string;
  iframeUrl: string;
  source: string;
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
