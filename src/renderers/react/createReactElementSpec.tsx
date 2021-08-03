import type { ReactElement } from "react";
import React from "react";
import { render } from "react-dom";
import { createElementSpec } from "../../plugin/elementSpec";
import type { Renderer, Validator } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { Consumer } from "../../plugin/types/Consumer";
import type { FieldSpec } from "../../plugin/types/Element";
import { ElementProvider } from "./ElementProvider";

export const createReactElementSpec = <FSpec extends FieldSpec<string>>(
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

  return createElementSpec(fieldSpec, renderer, validate, defaultState);
};
