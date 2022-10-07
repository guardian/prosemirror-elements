# Adding a new element using ProseMirror Elements
## Description
The purpose of this document is to give a quick and easy guide to creating an `Element` using prosemirror-elements.

We'll do this using React and Typescript, with the functions, types and React components that prosemirror-elements gives us for free.

### What is an `Element`?

An `Element` represents a user-defined data structure and its UI as displayed in Prosemirror. It has one to many `Fields`. Each field represents a value modelled by that element.

For the UI, `prosemirror-elements` provides React bindings by default, but is not tightly coupled to that framework – other bindings are possible, and should be straightforward to write. 

### What is a `Field`?
Each element is made up of `Fields`, which represent a value that the element contains. The value is strongly typed, and fields can represent any data that is serialisable to JSON.

To take an example, an element representing an inline quote might contain the following fields:

A `richText` field for styled quote content.
A `text` field for the quote's attribution.
A custom field to indicate the pullquote’s presentation (whether it sits inline with content, or to the side, etc.) This could be represented as a union of the possible states, e.g. `'supporting' | 'inline' | 'showcase'`.

## Example: creating a pullquote element in React
By convention, there are two parts to defining an `Element` – specifying its data requirements, and specifying its UI.

An element definition is a plain Javascript object, where the key is the name of the field, and the value is the field type. `prosemirror-elements` provides creator functions for Fields (e.g. `createTextField`, `createRichTextField`), to provide the right type. For the pullquote described above, this might look like:

```ts
import { createCustomDropdownField } from "../../plugin/fieldViews/CustomFieldView";
import { createRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { maxLength, required } from "../../plugin/helpers/validation";
 
export const quoteFields = {
 content: createRichTextField({
   validators: [
     // Fields can specify how to validate their data
     required("Quote cannot be empty"),
     maxLength(1000, "Quote is too long", "ERROR"),
   ],
   // They can also specify some presentation options for convenience
   placeholder: "Enter a quote here",
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

Let’s use React to achieve this. We have a convenient helper for providing a React UI, `createReactElementSpec`, which receives two arguments: the field description, and a React component that describes how the element should be rendered:
```ts
const pullquoteElement = createReactElementSpec(
 pullquoteFields,
 // We'll define our React component here
)
```

The component will receive a `fields` prop:
```tsx
const pullquoteElement = createReactElementSpec(
 pullquoteFields,
 ({ fields }) => {
   return <>
     {/* We'll define our element presentation here */}
   </>
 }
)
```
In `prosemirror-elements`, we’ve defined helper components to make it easy to expose inputs and data. Let’s use the `FieldWrapper` component to display an appropriate input for our `content` rich text Field:
```tsx
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
```tsx
const pullquoteElement = createReactElementSpec(
 pullquoteFields,
 ({ fields, fieldValues, errors }) => {
   return (
     <div>
       <FieldWrapper
         field={fields.content}
         headingLabel="Quote content"
       />
       <FieldWrapper
         field={fields.content}
         headingLabel="Attribution"
       />
     </div>
   );
 }
);
```
For our `role` field, we can make use of another React component designed to display dropdowns, `CustomDropdownView`:
```tsx
const pullquoteElement = createReactElementSpec(
 pullquoteFields,
 ({ fields, fieldValues, errors }) => {
   return (
     <div>
       <FieldWrapper
         field={fields.content}
         headingLabel="Pullquote content"
       />
       <FieldWrapper
         field={fields.content}
         headingLabel="Attribution"
       />
       <CustomDropdownView
         field={fields.role}
         label="Role"
         display="inline"
       />
     </div>
   );
 }
);
```
And that’s it! Note that we don’t need to make use of all of these fields in our component – we’re at liberty to choose whichever presentation we like.

Our pullquote doesn’t really need it, but in other contexts we might want to work with the current values of our fields. These are exposed in each field's `value` prop, so to reveal the pullquote content as we typed, we could write:

```tsx
const pullquoteElement = createReactElementSpec(
 pullquoteFields,
 ({ fields, fieldValues, errors }) => {
   return (
     <div>
       <FieldWrapper
         field={fields.content}
         headingLabel="Pullquote content"
       />
       <blockquote>
         {fields.content.value}
       </blockquote>
     </div>
   );
 }
);
```

## Where to keep our element
By convention, we’ve defined and kept our elements in `src/elements`. Let’s add our pullquote there, in `src/elements/example-pullquote/ExamplePullquote.tsx`, and export the element we’ve just created:
```tsx
export const pullquoteElement = createReactElementSpec(
  // …
```
