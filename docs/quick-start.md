# Adding a new element using ProseMirror Elements
## Description
The purpose of this document is to give a quick and easy guide to creating an element for a rich text editor using prosemirror-elements.

In this example we will demonstrating this using React with Typescript and utilising the array of functions, types and design patterns that prosemirror-elements gives us for free.

### What is an Element?
Modelling non-text content in Prosemirror can be tricky. Prosemirror-elements provides a new kind of entity, an Element, that makes this task easier. Elements contain user-defined Fields that can model many different kinds of content, including rich text fields and arbitrary data.

An Element and its Fields are represented as first class citizens of the Prosemirror schema – for example, nested rich text fields play nicely with collaborative editing.

Prosemirror-elements provides a way of expressing an Element and its Fields in the UI framework of your choice, and we provide React bindings as a default.
What is a Field?
Each Element is made up of Fields, which represent a data type – for example, text, rich text, or custom data types. 

For example, a Pullquote Element might contain the following fields:

A richText field for styled pullquote content.
A text field for the attribution.
A custom field, role, containing type `string` to indicate the pullquote’s presentation.
A custom field, isMandatory, containing type `boolean` to indicate whether the pullquote should always be displayed.
# Example: creating a pullquote Element in React
By convention, there are two parts to defining an Element – specifying its data requirements, and specifying its UI.

An Element specification is a plain Javascript object, where the key is the name of the field, and the value is the field type. `prosemirror-elements` provides creator functions for Fields (e.g. `createTextField`, `createRichTextField`), to provide the right type. For the pullquote described above, this might look like:
```js
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
```js
const pullquoteElement = createReactElementSpec(
 pullquoteFields,
 // We'll define our React component here
)
```

The Component will receive three React props, fields, errors, and fieldValues:
```js
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
```js
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
```js
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
```js
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
```js
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
```js
export const pullquoteElement = createReactElementSpec(
  // …
```

# Creating the Element Form
Elements saved in: `src/elements/<ElementName>/<ElementName>Form.tsx`
Again these imports are concerned with the layout of the component and the field representation within the component.


More can be found on the details here: 
`src/renderers/react/createReactElementSpec.tsx`
First Argument provided:
```js
export const helloElement = createReactElementSpec(
 helloFields,
 }
);
```

1. The second argument is a function which returns a react component. We will use destructuring to provide the fields, errors, fieldValues  for the function.
```js
export const helloElement = createReactElementSpec(
 helloFields,
 ({ fields, errors, fieldValues }) => {
   return (
   );
 }
);
```

2. Choose the type of layout
There are predefined layout templates in which to place your new element
```js
export const helloElement = createReactElementSpec(
 helloFields,
 ({ fields, errors, fieldValues }) => {
   return (
       <FieldLayoutVertical>
      // place field elements here
      </FieldLayoutVertical>
   );
 }
);
```

3. You need to decide which of the fields will need to be. In some cases the fields defined in the Spec do not all need to be reflected in the Element - these may take the meta data for the JSON representation to be used upstream.
The most basic being a FieldWrapper, providing the required props. Conveniently the fields argument gives us access to the field definitions from the Spec file (helloFields).
```js
export const helloElement = createReactElementSpec(
 helloFields,
 ({ fields, errors, fieldValues }) => {
   return (
     <FieldLayoutVertical>
       <FieldWrapper
         field={fields.exampleTextField}
         errors={errors.exampleTextField}
         headingLabel="Example Text Here"
       />
     </FieldLayoutVertical>
   );
 }
);
```
4. We can also add more field type components like CustomDropdownView which requires props to include the display type as well
```js
export const helloElement = createReactElementSpec(
 helloFields,
 ({ fields, errors, fieldValues }) => {
   return (
     <FieldLayoutVertical>
       <FieldWrapper
         field={fields.exampleTextField}
         errors={errors.exampleTextField}
         headingLabel="Example Text Here"
       />
       <CustomDropdownView
         field={fields.exampleDropDownField}
         label="Drop Down Example"
         errors={errors.exampleDropDownField}
         display="inline"
       />
     </FieldLayoutVertical>
   );
 }
);
```
