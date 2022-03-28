import { Column, Columns } from "@guardian/src-layout";
import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import { Preview } from "../helpers/Preview";
import type {
  contentAtomFields,
  FetchContentAtomData,
} from "./ContentAtomSpec";

type Props = {
  fieldValues: FieldNameToValueMap<typeof contentAtomFields>;
  fetchContentAtomData: FetchContentAtomData;
};

export const ContentAtomForm: React.FunctionComponent<Props> = ({
  fieldValues,
}) => (
  <div>
    <FieldLayoutVertical>
      <Columns>
        <Column width={1 / 3}>
          <Preview />
        </Column>
        <Column width={2 / 3}>
          <FieldLayoutVertical>
            <div>
              <h4>
                Content atom (
                <a href="" target="_blank">
                  embed link
                </a>
                )
              </h4>
            </div>
            <div>
              <h3>{fieldValues.atomType}</h3>
            </div>
          </FieldLayoutVertical>
        </Column>
      </Columns>
    </FieldLayoutVertical>
  </div>
);
