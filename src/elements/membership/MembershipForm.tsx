import { css } from "@emotion/react";
import { space } from "@guardian/src-foundations";
import React from "react";
import { InputHeading } from "../../editorial-source-components/InputHeading";
import { Link } from "../../editorial-source-components/Link";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { membershipFields } from "./MembershipSpec";

type Props = {
  fields: FieldNameToField<typeof membershipFields>;
};

const flexRow = css`
  display: flex;
  flex-direction: flex-row;
  gap: ${space[2]}px;
`;

export const MembershipElementTestId = "MembershipElement";

export const MembershipElementForm: React.FunctionComponent<Props> = ({
  fields,
}) => (
  <FieldLayoutVertical data-cy={MembershipElementTestId}>
    <div css={flexRow}>
      <InputHeading headingLabel="Membership event:" />
      <Link href={fields.originalUrl.value}>{fields.linkText.value}</Link>
    </div>
    <CustomDropdownView field={fields.role} label="Weighting" />
  </FieldLayoutVertical>
);
