import { upperFirst } from "lodash";
import React from "react";
import { Description } from "../../editorial-source-components/Description";
import { InputHeading } from "../../editorial-source-components/InputHeading";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldNameToField } from "../../plugin/types/Element";
import type { fields } from "./DeprecatedSpec";

type Props = {
  fields: FieldNameToField<typeof fields>;
};

const elementTypeToName = {
  instagram: "Instagram",
  vine: "Vine",
  witness: "Guardian Witness",
  form: "Formstack",
} as Record<string, string>;

export const DeprecatedForm: React.FunctionComponent<Props> = ({ fields }) => {
  const elementType =
    elementTypeToName[fields.type.value] || upperFirst(fields.type.value);
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
            <pre>{JSON.stringify(JSON.parse(fields.data.value), null, 2)}</pre>
          </details>
        </Description>
      </FieldLayoutVertical>
    </div>
  );
};
