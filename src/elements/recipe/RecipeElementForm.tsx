import React from "react";
import { DemoFieldWrapper } from "../../editorial-source-components/DemoFieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { recipeFields } from "./RecipeElementSpec";

export const RecipeElementTestId = "RecipeElement";

export const recipeElement = createReactElementSpec({
  fieldDescriptions: recipeFields,
  component: ({ fields }) => (
    <FieldLayoutVertical data-cy={RecipeElementTestId}>
      <DemoFieldWrapper headingLabel="Recipe" field={fields.recipeJson} />
    </FieldLayoutVertical>
  ),
});
