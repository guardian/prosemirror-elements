import { upperFirst } from "lodash";
import React, { useEffect, useState } from "react";
import { Error } from "../../editorial-source-components/Error";
import { Label, NonBoldLabel } from "../../editorial-source-components/Label";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Preview } from "../helpers/Preview";
import type { ContentAtomData, FetchContentAtomData } from "./ContentAtomSpec";
import { contentAtomFields } from "./ContentAtomSpec";

export const createContentAtomElement = (
  fetchContentAtomData: FetchContentAtomData
) =>
  createReactElementSpec(contentAtomFields, ({ fields }) => {
    const [contentAtomData, setContentAtomData] = useState<
      ContentAtomData | undefined
    >(undefined);

    useEffect(() => {
      void fetchContentAtomData(fields.atomType.value, fields.id.value).then(
        (data) => {
          setContentAtomData(data);
        }
      );
    }, [fields.atomType.value, fields.id.value]);

    return (
      <div>
        <FieldLayoutVertical>
          {!contentAtomData?.isPublished && (
            <Error>This {fields.atomType.value} is not published.</Error>
          )}
          {contentAtomData?.isPublished &&
            contentAtomData.hasUnpublishedChanges && (
              <Error>
                This {fields.atomType.value} has unpublished changes.
              </Error>
            )}
          <FieldLayoutVertical>
            <Label>
              Content atom (
              {contentAtomData?.embedLink && (
                <a target="_blank" href={contentAtomData.embedLink}>
                  embed link
                </a>
              )}
              {contentAtomData?.editorLink && (
                <>
                  <span>, </span>
                  <a target="_blank" href={contentAtomData.editorLink}>
                    edit link
                  </a>
                </>
              )}
              )
            </Label>
            <NonBoldLabel>
              {upperFirst(fields.atomType.value)}{" "}
              {contentAtomData?.title && ` - ${contentAtomData.title}`}
            </NonBoldLabel>
          </FieldLayoutVertical>
          <Preview
            html={contentAtomData?.defaultHtml}
            headingLabel={null}
            minHeight={100}
          />
          <CustomDropdownView field={fields.role} label="Weighting" />
          <CustomCheckboxView
            field={fields.isMandatory}
            label="This element is required for publication"
          />
        </FieldLayoutVertical>
      </div>
    );
  });
