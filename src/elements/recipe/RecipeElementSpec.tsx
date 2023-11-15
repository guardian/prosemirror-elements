import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createRepeaterField } from "../../plugin/fieldViews/RepeaterFieldView";
import { createRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import type { MediaPayload } from "../helpers/types/Media";

type Tag = {};
type DifficultyLevel = "easy" | "medium" | "hard";
type TimingQualifier = "passive" | "active" | "set" | "chill";
type Serves = {};

const ingredient = {
  name: createTextField(), // no text editor
  ingredientID: createTextField({ absentOnEmpty: true }), // no text editor
  amount: createCustomField<Range | undefined>(undefined, undefined),
  unit: createTextField({ absentOnEmpty: true }),
  prefix: createTextField({ absentOnEmpty: true }),
  suffix: createTextField({ absentOnEmpty: true }),
  text: createTextField({ absentOnEmpty: true }), // no text editor
  optional: createCustomField<boolean>(false, undefined),
};

const ingredientsGroup = {
  recipeSection: createTextField(),
  ingredientsList: createRepeaterField(ingredient),
};

const timingFields = {
  qualifier: createCustomField<TimingQualifier>("passive", undefined),
  duration: createCustomField<number>(0, undefined),
  text: createTextField(), // no text editor,
};

const instructionFields = {
  stepNumber: createCustomField<number>(1, undefined),
  description: createRichTextField({
    placeholder: "Describe this step of the recipe …",
  }),
  images: createCustomField<MediaPayload[]>([], undefined),
};

export const recipeFields = {
  id: createTextField(), // no text editor
  canonicalArticle: createTextField(), // no text editor
  title: createTextField(),
  description: createTextField(),
  featureImage: createCustomField<MediaPayload | undefined>(undefined, {}),
  contributors: createCustomField<Tag[]>([], undefined),
  byline: createCustomField<string>("", {}),
  ingredients: createRepeaterField(ingredientsGroup),
  suitableForDietIds: createCustomField<string[]>([], undefined),
  cuisineIds: createCustomField<string[]>([], undefined),
  mealTypeIds: createCustomField<string[]>([], undefined),
  celebrationIds: createCustomField<string[]>([], undefined),
  utilsAndApplianceIds: createCustomField<string[]>([], undefined),
  techniquesUsedIds: createCustomField<string[]>([], undefined),
  difficultyLevel: createCustomField<DifficultyLevel>("easy", undefined),
  serves: createCustomField<Serves | undefined>(undefined, undefined),
  timings: createRepeaterField(timingFields),
  instructions: createRepeaterField(instructionFields),
};
