import React, { useState } from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { recipeFields } from "./RecipeElementSpec";
import styled from "@emotion/styled";

export const RecipeElementTestId = "RecipeElement";

const RecipeSection: React.FC<{
  title: string;
  isOpen: boolean;
  toggleOpenState: () => void;
}> = ({ title, children, isOpen, toggleOpenState }) => (
  <>
    <h2 onClick={() => toggleOpenState()}>
      {title}
      {isOpen ? "▼" : "▶"}
    </h2>
    {isOpen && children}
  </>
);

const initialOpenStates = {
  ingredients: false,
  instructions: false,
};

export const recipeElement = createReactElementSpec(
  recipeFields,
  ({ fields }) => {
    const [openStates, setOpenStates] = useState(initialOpenStates);

    const toggleOpenState = React.useMemo(
      () => (groupName: keyof typeof openStates) => () =>
        setOpenStates({ ...openStates, [groupName]: !openStates[groupName] }),
      [openStates]
    );

    return (
      <FieldLayoutVertical data-cy={RecipeElementTestId}>
        <FieldWrapper headingLabel="Title" field={fields.title} />
        <FieldWrapper headingLabel="Description" field={fields.title} />
        <RecipeSection
          isOpen={openStates.ingredients}
          toggleOpenState={toggleOpenState("ingredients")}
          title="Ingredients"
        ></RecipeSection>
        <RecipeSection
          isOpen={openStates.instructions}
          toggleOpenState={toggleOpenState("instructions")}
          title="Instructions"
        ></RecipeSection>
      </FieldLayoutVertical>
    );
  }
);
