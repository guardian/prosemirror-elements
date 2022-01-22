import type { ReactElement } from "react";
import React from "react";
import { render } from "react-dom";
import { createElementSpec } from "../../plugin/elementSpec";
import type { Renderer, Validator } from "../../plugin/elementSpec";
import type { Consumer } from "../../plugin/types/Consumer";
import type { FieldDescriptions } from "../../plugin/types/Element";
import { ElementProvider } from "./ElementProvider";

export const createReactElementSpec = <FDesc extends FieldDescriptions<string>>(
  fieldDescriptions: FDesc,
  consumer: Consumer<ReactElement, FDesc>,
  validate: Validator<FDesc> | undefined = undefined
) => {
  const renderer: Renderer<FDesc> = (
    validate,
    dom,
    fields,
    fieldValues,
    commands,
    subscribe
  ) =>
    render(
      <ElementProvider<FDesc>
        subscribe={subscribe}
        fields={fields}
        validate={validate}
        commands={commands}
        consumer={consumer}
        fieldValues={fieldValues}
      />,
      dom
    );

  return createElementSpec(fieldDescriptions, renderer, validate);
};
