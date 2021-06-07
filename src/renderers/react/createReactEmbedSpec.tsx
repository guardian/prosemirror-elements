import type { ReactElement } from "react";
import React from "react";
import { render } from "react-dom";
import { createEmbedSpec } from "../../embedSpec";
import type { Renderer, Validator } from "../../embedSpec";
import type { FieldNameToValueMap } from "../../nodeViews/helpers";
import type { Consumer } from "../../types/Consumer";
import type { FieldSpec } from "../../types/Embed";
import { EmbedProvider } from "./EmbedProvider";

export const createReactEmbedSpec = <
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
      <EmbedProvider<FSpec>
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

  return createEmbedSpec(name, fieldSpec, renderer, validate, defaultState);
};
