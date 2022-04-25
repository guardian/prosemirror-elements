import { upperFirst } from "lodash";
import React, { useEffect, useState } from "react";
import { Error } from "../../editorial-source-components/Error";
import { Label, NonBoldLabel } from "../../editorial-source-components/Label";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldValidationErrors } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Preview } from "../helpers/Preview";
import type {
  ContentAtomData,
  contentAtomFields,
  FetchContentAtomData,
} from "./ContentAtomSpec";

type Props = {
  fields: FieldNameToField<typeof contentAtomFields>;
  fieldValues: FieldNameToValueMap<typeof contentAtomFields>;
  errors: FieldValidationErrors;
  fetchContentAtomData: FetchContentAtomData;
};

export const ContentAtomForm: React.FunctionComponent<Props> = ({
  fields,
  fieldValues,
  errors,
  fetchContentAtomData,
}) => {
  const { id, atomType } = fieldValues;

  const [contentAtomData, setContentAtomData] = useState<
    ContentAtomData | undefined
  >(undefined);

  useEffect(() => {
    void fetchContentAtomData(atomType, id).then((data) => {
      setContentAtomData(data);
    });
  }, [atomType, id]);

  return (
    <div>
      <FieldLayoutVertical>
        {!contentAtomData?.isPublished && (
          <Error>This {atomType} is not published.</Error>
        )}
        {contentAtomData?.isPublished &&
          contentAtomData.hasUnpublishedChanges && (
            <Error>This {atomType} has unpublished changes.</Error>
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
            {upperFirst(atomType)}{" "}
            {contentAtomData?.title && ` - ${contentAtomData.title}`}
          </NonBoldLabel>
        </FieldLayoutVertical>
        <Preview
          html={contentAtomData?.defaultHtml}
          headingLabel={null}
          minHeight={100}
        />
        <CustomDropdownView
          field={fields.role}
          label="Weighting"
          errors={errors.role}
        />
        <CustomCheckboxView
          field={fields.isMandatory}
          errors={errors.isMandatory}
          label="This element is required for publication"
        />
      </FieldLayoutVertical>
    </div>
  );
};
