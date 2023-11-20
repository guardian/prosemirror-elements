import { upperFirst } from "lodash";
import { useEffect, useState } from "react";
import { Error } from "../../editorial-source-components/Error";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { Label, NonBoldLabel } from "../../editorial-source-components/Label";
import { undefinedDropdownValue } from "../../plugin/helpers/constants";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Preview } from "../helpers/Preview";
import type { ContentAtomData, FetchContentAtomData } from "./ContentAtomSpec";
import { contentAtomFields } from "./ContentAtomSpec";

const interactiveOptions = [
  { text: "inline (default)", value: undefinedDropdownValue },
  { text: "supporting", value: "supporting" },
  { text: "showcase", value: "showcase" },
  { text: "thumbnail", value: "thumbnail" },
  { text: "immersive", value: "immersive" },
];

export const createContentAtomElement = (
  fetchContentAtomData: FetchContentAtomData
) =>
  createReactElementSpec({
    fieldDescriptions: contentAtomFields,
    consumer: ({ fields }) => {
      const [contentAtomData, setContentAtomData] = useState<
        ContentAtomData | undefined
      >(undefined);

      const {
        atomType: { value: atomType },
        id: { value: id },
      } = fields;

      useEffect(() => {
        void fetchContentAtomData(atomType, id).then((data) => {
          setContentAtomData(data);
        });
      }, [atomType, id]);

      const weightingOptions =
        atomType === "interactive"
          ? interactiveOptions
          : fields.role.description.props;

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
              options={weightingOptions}
            />
            <CustomCheckboxView
              field={fields.isMandatory}
              label="This element is required for publication"
            />
          </FieldLayoutVertical>
        </div>
      );
    },
  });
