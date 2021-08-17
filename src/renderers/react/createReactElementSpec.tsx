import type { ReactElement } from "react";
import React from "react";
import { render } from "react-dom";
import { createElementSpec } from "../../plugin/elementSpec";
import type { Renderer, Validator } from "../../plugin/elementSpec";
import type { Consumer } from "../../plugin/types/Consumer";
import type { FieldSpec, Transformers } from "../../plugin/types/Element";
import { ElementProvider } from "./ElementProvider";

export const createReactElementSpec = <
  FSpec extends FieldSpec<string>,
  ExternalData
>(
  fieldSpec: FSpec,
  consumer: Consumer<ReactElement, FSpec>,
  validate: Validator<FSpec>,
  transformers?: Transformers<FSpec, ExternalData>
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

  return createElementSpec(fieldSpec, renderer, validate, transformers);
};
