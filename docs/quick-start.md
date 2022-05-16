# Adding a new element using ProseMirror Elements
## Description
The purpose of this document is to give a quick and easy guide to creating an `Element` using prosemirror-elements.

We'll do this using React and Typescript, with the functions, types and React components that prosemirror-elements gives us for free.

### What is an Element?
Modelling non-text content in Prosemirror can be tricky. Prosemirror-elements provides a new kind of entity, an Element, that makes this task easier. Elements contain user-defined Fields that can model many different kinds of content, including rich text fields and arbitrary data.

### An Element and its Fields are represented as first class citizens of the Prosemirror schema – for example, nested rich text fields play nicely with collaborative editing.

### Prosemirror-elements provides a way of expressing an Element and its Fields in the UI framework of your choice, and we provide React bindings as a default.
### What is a Field?
Each Element is made up of Fields, which represent a data type – for example, text, rich text, or custom data types. 

For example, a Pullquote Element might contain the following fields:

A richText field for styled pullquote content.
A text field for the attribution.
A custom field, role, containing type `string` to indicate the pullquote’s presentation.
A custom field, isMandatory, containing type `boolean` to indicate whether the pullquote should always be displayed.
## Example: creating a pullquote Element in React
By convention, there are two parts to defining an Element – specifying its data requirements, and specifying its UI.

An Element specification is a plain Javascript object, where the key is the name of the field, and the value is the field type. `prosemirror-elements` provides creator functions for Fields (e.g. `createTextField`, `createRichTextField`), to provide the right type. For the pullquote described above, this might look like:
```ts
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { maxLength, required } from "../../plugin/helpers/validation";
 
export const pullquoteFields = {
 content: createRichTextField({
   validators: [
     // Fields can specify how to validate their data
     required("Pullquote cannot be empty"),
     maxLength(1000, "Pullquote is too long", "ERROR"),
   ],
   // They can also specify some presentation options for convenience
   placeholder: "Enter a pull quote here",
 }),
 attribution: createTextField({
   placeholder: "Enter attribution here",
 }),
 role: createCustomDropdownField("supporting", [
   { text: "supporting (default)", value: "supporting" },
   { text: "inline", value: "inline" },
   { text: "showcase", value: "showcase" },
 ]),
};
```
That wraps up the data requirements – now we’ll need to specify a UI for this Element.

Let’s use React to achieve this. We have a convenient helper for providing a React UI, `createReactElementSpec`, which receives two arguments: the Field Description, and a React Component that describes how the Element should be rendered:
```ts
const pullquoteElement = createReactElementSpec(
 pullquoteFields,
 // We'll define our React component here
)
```

The Component will receive three React props, fields, errors, and fieldValues:
```ts
const pullquoteElement = createReactElementSpec(
 pullquoteFields,
 ({ fields, fieldValues, errors }) => {
   return <>
     {/* We'll define our element presentation here */}
   </>
 }
)
```
In `prosemirror-elements`, we’ve defined helper components to make it easy to expose inputs and data. Let’s use the `FieldWrapper` component to display an appropriate input for our `content` rich text Field:
```ts
const pullquoteElement = createReactElementSpec(
 pullquoteFields,
 ({ fields, fieldValues, errors }) => {
   return (
     <div>
       <FieldWrapper
         field={fields.content}
         errors={errors.content}
         headingLabel="Pullquote content"
       />
     </div>
   );
 }
);
```
We can do the same thing with our text `attribution` Field:
```ts
const pullquoteElement = createReactElementSpec(
 pullquoteFields,
 ({ fields, fieldValues, errors }) => {
   return (
     <div>
       <FieldWrapper
         field={fields.content}
         errors={errors.content}
         headingLabel="Pullquote content"
       />
       <FieldWrapper
         field={fields.content}
         errors={errors.content}
         headingLabel="Attribution"
       />
     </div>
   );
 }
);
```
For our `role` Field, we can make use of another React component designed to display dropdowns, `CustomDropdownView`:
```ts
const pullquoteElement = createReactElementSpec(
 pullquoteFields,
 ({ fields, fieldValues, errors }) => {
   return (
     <div>
       <FieldWrapper
         field={fields.content}
         errors={errors.content}
         headingLabel="Pullquote content"
       />
       <FieldWrapper
         field={fields.content}
         errors={errors.content}
         headingLabel="Attribution"
       />
       <CustomDropdownView
         field={fields.role}
         label="Role"
         errors={errors.role}
         display="inline"
       />
     </div>
   );
 }
);
```
And that’s it! Note that we don’t need to make use of all of these Fields in our component – we’re at liberty to choose whichever presentation we like.

Our pullquote doesn’t really need it, but in other contexts we might want to work with the current values of our Fields. These are exposed in our `fieldValues` prop, so to reveal the pullquote content as we typed, we could write:
```ts
const pullquoteElement = createReactElementSpec(
 pullquoteFields,
 ({ fields, fieldValues, errors }) => {
   return (
     <div>
       <FieldWrapper
         field={fields.content}
         errors={errors.content}
         headingLabel="Pullquote content"
       />
       <blockquote>
         {fieldValues.content}
       </blockquote>
     </div>
   );
 }
);
```

## Where to keep our element
By convention, we’ve defined and kept our elements in `src/elements`. Let’s add our pullquote there, in `src/elements/example-pullquote/ExamplePullquote.tsx`, and export the element we’ve just created:
```ts
export const pullquoteElement = createReactElementSpec(
  // …
```