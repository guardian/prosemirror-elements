import { css } from "@emotion/react";
import { space } from "@guardian/src-foundations";
import React from "react";
import { InputHeading } from "../../editorial-source-components/InputHeading";
import { Link } from "../../editorial-source-components/Link";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { membershipFields } from "./MembershipSpec";

const flexRow = css`
  display: flex;
  flex-direction: flex-row;
  gap: ${space[2]}px;
`;

export const MembershipElementTestId = "MembershipElement";

export const membershipElement = createReactElementSpec(
  membershipFields,
  ({ fields }) => (
    <FieldLayoutVertical data-cy={MembershipElementTestId}>
      <div css={flexRow}>
        <InputHeading headingLabel="Membership event:" />
        <Link href={fields.originalUrl.value}>{fields.linkText.value}</Link>
      </div>
      <CustomDropdownView field={fields.role} label="Weighting" />
    </FieldLayoutVertical>
  )
);
