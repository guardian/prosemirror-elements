import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { createRepeaterField } from "../../plugin/fieldViews/RepeaterFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";

const repeaterImageFields = {
  textField: createTextField(),
  repeaterField: createRepeaterField({
    textField: createTextField(),
    nestedRepeaterField: createRepeaterField({
      anotherTextField: createTextField(),
    }),
  }),
};

export const repeaterElement = createReactElementSpec(
  repeaterImageFields,
  ({ fields }) => (
    <div>
      <FieldWrapper headingLabel="Non-nested text" field={fields.textField} />
      {fields.repeaterField.children.map((field, index) => (
        <React.Fragment key={index}>
          <FieldWrapper
            headingLabel="Text field, depth 1"
            field={field.textField}
          />
          {field.nestedRepeaterField.children.map((nestedField, index) => (
            <FieldWrapper
              key={index}
              headingLabel="Text field, depth 2"
              field={nestedField.anotherTextField}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  )
);
