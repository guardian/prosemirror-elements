import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { recipeFields } from "./RecipeElementSpec";

export const RecipeElementTestId = "RecipeElement";

export const recipeElement = createReactElementSpec({
  fieldDescriptions: recipeFields,
  component: ({ fields }) => (
    <FieldLayoutVertical data-cy={RecipeElementTestId}>
      <FieldWrapper headingLabel="Recipe" field={fields.recipeJson} />
    </FieldLayoutVertical>
  ),
});
