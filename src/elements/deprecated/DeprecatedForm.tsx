import { upperFirst } from "lodash";
import React from "react";
import { Description } from "../../editorial-source-components/Description";
import { InputHeading } from "../../editorial-source-components/InputHeading";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { fields } from "./DeprecatedSpec";

type Props = {
  fieldValues: FieldNameToValueMap<typeof fields>;
};

const elementTypeToName = {
  instagram: "Instagram",
  vine: "Vine",
  witness: "Guardian Witness",
} as Record<string, string>;

export const DeprecatedForm: React.FunctionComponent<Props> = ({
  fieldValues,
}) => (
  <div>
    <FieldLayoutVertical>
      <InputHeading
        headingLabel={`Content from ${
          elementTypeToName[fieldValues.type] || upperFirst(fieldValues.type)
        }`}
      />
      <Description>
        <p>
          This way of representing content of this type is no longer used, and
          may not appear on some or all platforms.
        </p>
        <details>
          <summary>Show content data</summary>
          <pre>{JSON.stringify(JSON.parse(fieldValues.data), null, 2)}</pre>
        </details>
      </Description>
    </FieldLayoutVertical>
  </div>
);
