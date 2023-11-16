import { useState } from "react";
import type { FieldNameToField } from "../../plugin/types/Element";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { DetailedRecipeForm } from "./DetailedRecipeForm";
import { recipeFields } from "./RecipeElementSpec";

export type RecipeFormProps = {
  fields: FieldNameToField<typeof recipeFields>;
};

const tabNames = [
  { name: "Form", component: DetailedRecipeForm },
  { name: "Raw data", component: () => <div>No raw form yet</div> },
];

export const recipeElement = createReactElementSpec(
  recipeFields,
  ({ fields }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const FormComponent = tabNames[tabIndex].component;
    return (
      <div>
        <ul className="tablist" role="tablist">
          {tabNames.map((tab, index) => (
            <li
              key={tab.name}
              id="tab1"
              onClick={() => setTabIndex(index)}
              className="tab"
              aria-controls="panel1"
              role="tab"
            >
              {tab.name}
            </li>
          ))}
        </ul>
        <FormComponent fields={fields} />
      </div>
    );
  }
);
