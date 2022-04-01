import { Column, Columns } from "@guardian/src-layout";
import React, { useState } from "react";
import { Error } from "../../editorial-source-components/Error";
import { Label } from "../../editorial-source-components/Label";
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
  fetchContentAtomData,
}) => {
  const { id, atomType } = fieldValues;

  const [{ html, title, published, embedLink, editorLink }] = useState(
    fetchContentAtomData(id, atomType)
  );

  return (
    <div>
      <FieldLayoutVertical>
        {!published && <Error>This video atom has unpublished changes.</Error>}
        <Columns>
          <Column width={1 / 3}>
            <Preview html={html} headingLabel={null} />
          </Column>
          <Column width={2 / 3}>
            <FieldLayoutVertical>
              <Label>
                Content atom (<a href={embedLink}>embed link</a>)
              </Label>
              {editorLink && (
                <Label>
                  <a href={editorLink}>Edit atom</a>
                </Label>
              )}
              <Label>
                {atomType} {title && ` - ${title}`}
              </Label>
            </FieldLayoutVertical>
          </Column>
        </Columns>
      </FieldLayoutVertical>
    </div>
  );
};
