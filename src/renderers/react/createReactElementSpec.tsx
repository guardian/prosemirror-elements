import type { ReactElement } from "react";
import React from "react";
import { render } from "react-dom";
import { createElementSpec } from "../../elementSpec";
import type { Renderer, Validator } from "../../elementSpec";
import type { FieldNameToValueMap } from "../../fieldViews/helpers";
import type { Consumer } from "../../types/Consumer";
import type { FieldSpec } from "../../types/Element";
import { ElementProvider } from "./ElementProvider";

export const createReactElementSpec = <
  FSpec extends FieldSpec<string>,
  Name extends string
>(
  name: Name,
  fieldSpec: FSpec,
  consumer: Consumer<ReactElement, FSpec>,
  validate: Validator<FSpec>,
  defaultState: FieldNameToValueMap<FSpec>
) => {
  const renderer: Renderer<FSpec> = (
    validate,
    dom,
    fields,
    updateState,
    fieldValues,
    commands,
    subscribe
  ) =>
    render(
      <ElementProvider<FSpec>
        subscribe={subscribe}
        onStateChange={updateState}
        fields={fields}
        validate={validate}
        commands={commands}
        consumer={consumer}
        fieldValues={fieldValues}
      />,
      dom
    );

  return createElementSpec(name, fieldSpec, renderer, validate, defaultState);
};
