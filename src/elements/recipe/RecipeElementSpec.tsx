import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createRepeaterField } from "../../plugin/fieldViews/RepeaterFieldView";
import { createRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import type { MediaPayload } from "../helpers/types/Media";

type Tag = unknown;
type Range = { min: number; max: number };

const unitOptions = [
  { text: "Tbsp", value: "tbsp" },
  { text: "Tsp", value: "tsp" },
];

const difficultyOptions = [
  { text: "Easy", value: "easy" },
  { text: "Medium", value: "medium" },
  { text: "Hard", value: "hard" },
];

const timingQualifierOptions = [
  { text: "Cook", value: "cook" },
  { text: "Set", value: "set" },
  { text: "Chill", value: "chill" },
];

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

export const ingredientsGroupFields = {
  recipeSection: createTextField(),
  ingredientsList: createRepeaterField(ingredient),
};

const timingFields = {
  qualifier: createCustomDropdownField("active", timingQualifierOptions),
  duration: createCustomField<number>(0, undefined),
  text: createTextField(), // no text editor
};

const instructionFields = {
  stepNumber: createCustomField<number>(1, undefined),
  description: createRichTextField({
    placeholder: "Describe this step of the recipe …",
  }),
  images: createCustomField<MediaPayload[]>([], undefined),
};

const servesFields = {
  amount: createCustomField<Range>({ min: 1, max: 1 }, undefined),
  unit: createCustomDropdownField("people", unitOptions),
  text: createTextField(),
};

export const recipeFields = {
  id: createTextField(), // no text editor
  composerId: createTextField({ absentOnEmpty: true }), // no text editor
  canonicalArticle: createTextField(), // no text editor
  title: createTextField(),
  description: createTextField(),
  featureImage: createCustomField<MediaPayload | undefined>(undefined, {}),
  contributors: createCustomField<Tag[]>([], undefined),
  byline: createCustomField<string>("", {}),
  ingredients: createRepeaterField(ingredientsGroupFields),
  suitableForDietIds: createCustomField<string[]>([], undefined),
  cuisineIds: createCustomField<string[]>([], undefined),
  mealTypeIds: createCustomField<string[]>([], undefined),
  celebrationIds: createCustomField<string[]>([], undefined),
  utilsAndApplianceIds: createCustomField<string[]>([], undefined),
  techniquesUsedIds: createCustomField<string[]>([], undefined),
  difficultyLevel: createCustomDropdownField("easy", difficultyOptions),
  serves: createRepeaterField(servesFields),
  timings: createRepeaterField(timingFields),
  instructions: createRepeaterField(instructionFields),
};
