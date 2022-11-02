import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { TransformIn, TransformOut } from "../helpers/types/Transform";
import type { membershipFields } from "./MembershipSpec";

export type ExternalMembershipFields = {
  linkText: string;
  isMandatory: string;
  identifier: string;
  role: string | undefined;
  image: string;
  originalUrl: string;
  price: string;
  linkPrefix: string;
  end: string;
  title: string;
  start: string;
};

export type ExternalMembershipData = {
  assets: [];
  fields: ExternalMembershipFields;
};

export type PartialMembershipData = {
  fields: Partial<ExternalMembershipFields>;
};

export const transformElementIn: TransformIn<
  PartialMembershipData,
  typeof membershipFields
> = ({ fields }) => {
  const { role, ...rest } = fields;

  return {
    role: role ?? undefinedDropdownValue,
    ...rest,
  };
};

export const transformElementOut: TransformOut<
  ExternalMembershipData,
  typeof membershipFields
> = ({
  role,
  ...rest
}: FieldNameToValueMap<typeof membershipFields>): ExternalMembershipData => {
  return {
    assets: [],
    fields: {
      isMandatory: "true",
      role: role === undefinedDropdownValue ? undefined : role,
      ...rest,
    },
  };
};

export const transformElement = {
  in: transformElementIn,
  out: transformElementOut,
};
