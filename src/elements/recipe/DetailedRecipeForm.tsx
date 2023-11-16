import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { Column, Columns } from "@guardian/src-layout";
import React, { useState } from "react";
import { Button } from "../../editorial-source-components/Button";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { Tooltip } from "../../editorial-source-components/Tooltip";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import type { recipeFields } from "./RecipeElementSpec";

export const RecipeElementTestId = "RecipeElement";

const RecipeSectionHeading = styled.h2`
  display: flex;
  cursor: pointer;
`;

const RecipeSectionAdditionalContent = styled.div`
  margin-left: auto;
`;

const NestedSection = styled.div`
  display: flex;
`;
const NestedSectionMeta = styled.div`
  padding: ${space[1]}px;
`;
const NestedSectionContent = styled.div`
  padding: ${space[1]}px;
  width: 100%;
`;

const RecipeSection: React.FC<{
  title: React.ReactNode;
  isOpen: boolean;
  toggleOpenState: () => void;
  additionalContent?: React.ReactNode;
}> = ({ title, children, isOpen, toggleOpenState, additionalContent }) => (
  <>
    <RecipeSectionHeading onClick={() => toggleOpenState()}>
      {isOpen ? "▼" : "▶"} {title}
      <RecipeSectionAdditionalContent>
        {additionalContent}
      </RecipeSectionAdditionalContent>
    </RecipeSectionHeading>
    {isOpen && children}
  </>
);

const initialOpenStates = {
  serves: true,
  timings: true,
  ingredients: false,
  instructions: false,
};

export const DetailedRecipeForm = ({
  fields,
}: {
  fields: FieldNameToField<typeof recipeFields>;
}) => {
  const [openStates, setOpenStates] = useState(initialOpenStates);

  const toggleOpenState = React.useMemo(
    () => (groupName: keyof typeof openStates) => () =>
      setOpenStates({ ...openStates, [groupName]: !openStates[groupName] }),
    [openStates]
  );

  const ingredientsCount = fields.ingredients.children.length;
  const recipeStepsCount = fields.instructions.children.length;

  return (
    <FieldLayoutVertical data-cy={RecipeElementTestId}>
      <FieldWrapper headingLabel="Title" field={fields.title} />
      <FieldWrapper
        headingLabel="Description"
        headingContent={
          <Tooltip>
            <p>A short description of the recipe content.</p>
          </Tooltip>
        }
        field={fields.description}
      />
      <RecipeSection
        isOpen={openStates.serves}
        toggleOpenState={toggleOpenState("serves")}
        title="Serves"
        additionalContent={
          <div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                fields.serves.view.add();
              }}
            >
              Add another serving
            </Button>
          </div>
        }
      >
        {fields.serves.children.map((serving, index) => (
          <NestedSection key={serving.__ID}>
            <NestedSectionMeta>
              <Button onClick={() => fields.serves.view.remove(index)}>
                x
              </Button>
            </NestedSectionMeta>
            <NestedSectionContent>
              <Columns>
                <Column width={1 / 5}>
                  <pre>serves.amount: Awaiting numeric input</pre>
                </Column>
                <Column width={1 / 5}>
                  <CustomDropdownView label="Unit" field={serving.unit} />
                </Column>
              </Columns>
            </NestedSectionContent>
          </NestedSection>
        ))}
      </RecipeSection>
      <RecipeSection
        isOpen={openStates.timings}
        toggleOpenState={toggleOpenState("timings")}
        title="Timings"
        additionalContent={
          <div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                fields.timings.view.add();
              }}
            >
              Add another timing
            </Button>
          </div>
        }
      >
        {fields.timings.children.map((timing, index) => (
          <NestedSection key={timing.__ID}>
            <NestedSectionMeta>
              <Button onClick={() => fields.serves.view.remove(index)}>
                x
              </Button>
            </NestedSectionMeta>
            <NestedSectionContent>
              <Columns>
                <Column width={1 / 5}>
                  <CustomDropdownView label="Unit" field={timing.qualifier} />
                </Column>
                <Column width={1 / 5}>
                  <pre>timings.duration: Awaiting numeric input</pre>
                </Column>
              </Columns>
            </NestedSectionContent>
          </NestedSection>
        ))}
      </RecipeSection>
      <pre>Byline: awaiting data format</pre>
      <pre>featuredImage: awaiting data format</pre>
      <pre>suitableForDietIds: awaiting multiselect</pre>
      <pre>cuisineIds: awaiting multiselect</pre>
      <pre>mealTypeIds: awaiting multiselect</pre>
      <pre>celebrationsIds: awaiting multiselect</pre>
      <pre>utensilsAndApplianceIds: awaiting multiselect</pre>
      <pre>techniquesUsedIds: awaiting multiselect</pre>
      <RecipeSection
        isOpen={openStates.ingredients}
        toggleOpenState={toggleOpenState("ingredients")}
        title={`Ingredient groups${
          ingredientsCount ? ` (${ingredientsCount})` : ""
        }`}
        additionalContent={
          <div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                fields.ingredients.view.add();
              }}
            >
              Add ingredient section
            </Button>
          </div>
        }
      >
        {fields.ingredients.children.map(
          (ingredientGroupField, index: number) => {
            const ingredientCount =
              ingredientGroupField.ingredientsList.children.length;
            return (
              <NestedSection key={ingredientGroupField.__ID}>
                <NestedSectionMeta>
                  <Button onClick={() => fields.ingredients.view.remove(index)}>
                    x
                  </Button>
                </NestedSectionMeta>
                <NestedSectionContent>
                  <FieldWrapper
                    headingLabel="Recipe section"
                    field={ingredientGroupField.recipeSection}
                  />
                  <h3>
                    Ingredients
                    {ingredientCount ? ` (${ingredientCount})` : ""}
                  </h3>
                  {ingredientGroupField.ingredientsList.children.map(
                    (ingredientField, index) => (
                      <React.Fragment key={ingredientField.__ID}>
                        <NestedSection>
                          <NestedSectionMeta>
                            <Button
                              onClick={() =>
                                ingredientGroupField.ingredientsList.view.remove(
                                  index
                                )
                              }
                            >
                              x
                            </Button>
                          </NestedSectionMeta>
                          <NestedSectionContent>
                            <Columns>
                              <Column width={1 / 5}>
                                <FieldWrapper
                                  headingLabel="Name"
                                  field={ingredientField.name}
                                />{" "}
                              </Column>
                              <Column width={1 / 5}>
                                <pre>Amount: awaiting numeric input</pre>
                              </Column>
                              <Column width={1 / 5}>
                                <FieldWrapper
                                  headingLabel="Unit"
                                  field={ingredientField.unit}
                                />{" "}
                              </Column>
                              <Column width={1 / 5}>
                                <FieldWrapper
                                  headingLabel="Prefix"
                                  field={ingredientField.prefix}
                                />{" "}
                              </Column>
                              <Column width={1 / 5}>
                                <FieldWrapper
                                  headingLabel="Suffix"
                                  field={ingredientField.suffix}
                                />{" "}
                              </Column>
                            </Columns>
                          </NestedSectionContent>
                        </NestedSection>
                      </React.Fragment>
                    )
                  )}
                </NestedSectionContent>
                <Button
                  onClick={() =>
                    ingredientGroupField.ingredientsList.view.add()
                  }
                >
                  Add ingredient
                </Button>
              </NestedSection>
            );
          }
        )}
      </RecipeSection>
      <RecipeSection
        isOpen={openStates.instructions}
        toggleOpenState={toggleOpenState("instructions")}
        title={`Recipe steps ${
          recipeStepsCount ? ` (${recipeStepsCount})` : ""
        }`}
        additionalContent={
          <div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                fields.instructions.view.add();
              }}
            >
              Add step
            </Button>
          </div>
        }
      >
        {fields.instructions.children.map((instruction, index) => (
          <NestedSection key={instruction.__ID}>
            <NestedSectionMeta>
              <Button onClick={() => fields.instructions.view.remove(index)}>
                x
              </Button>
            </NestedSectionMeta>
            <NestedSectionContent>
              <FieldWrapper
                headingLabel="Description"
                field={instruction.description}
              />
            </NestedSectionContent>
          </NestedSection>
        ))}
      </RecipeSection>
    </FieldLayoutVertical>
  );
};
