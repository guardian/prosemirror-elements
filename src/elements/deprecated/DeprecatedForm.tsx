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
  form: "FormStack",
} as Record<string, string>;

export const DeprecatedForm: React.FunctionComponent<Props> = ({
  fieldValues,
}) => {
  const elementType =
    elementTypeToName[fieldValues.type] || upperFirst(fieldValues.type);
  return (
    <div>
      <FieldLayoutVertical>
        <InputHeading headingLabel={`Content from ${elementType}`} />
        <Description>
          <p>
            This element represents content from {elementType}. It was added in
            an older version of Composer and may not be supported or render
            correctly on all platforms.
          </p>
          <p>
            Please contact{" "}
            <a
              target="_blank"
              rel="noopener"
              href="central.production@guardian.co.uk"
            >
              Central Production
            </a>{" "}
            if you need more information.
          </p>
          <details>
            <summary>Show content data</summary>
            <pre>{JSON.stringify(JSON.parse(fieldValues.data), null, 2)}</pre>
          </details>
        </Description>
      </FieldLayoutVertical>
    </div>
  );
};
