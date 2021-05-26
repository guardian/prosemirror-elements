import type { ReactElement } from "react";
import React from "react";
import { render } from "react-dom";
import { createEmbedSpec } from "../../embedSpec";
import type { TRenderer, Validator } from "../../embedSpec";
import type { FieldNameToValueMap } from "../../nodeViews/helpers";
import type { TConsumer } from "../../types/Consumer";
import type { FieldSpec } from "../../types/Embed";
import { EmbedProvider } from "./EmbedProvider";

export const createReactEmbedSpec = <
  FSpec extends FieldSpec<string>,
  Name extends string
>(
  name: Name,
  fieldSpec: FSpec,
  consumer: TConsumer<ReactElement, FSpec>,
  validate: Validator<FSpec>,
  defaultState: FieldNameToValueMap<FSpec>
) => {
  const renderer: TRenderer<ReactElement, FSpec> = (
    consumer,
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
        fields={fields}
      />,
      dom
    );

  return createEmbedSpec(
    name,
    fieldSpec,
    renderer,
    consumer,
    validate,
    defaultState
  );
};
