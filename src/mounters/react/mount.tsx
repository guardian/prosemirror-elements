import type { ReactElement } from "react";
import React from "react";
import { render } from "react-dom";
import { mount } from "../../mount";
import type { TRenderer, Validator } from "../../mount";
import type { FieldNameToValueMap } from "../../nodeViews/helpers";
import type { TConsumer } from "../../types/Consumer";
import type { FieldSpec } from "../../types/Embed";
import { EmbedProvider } from "./EmbedProvider";

export const createReactEmbedRenderer = <
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
    nestedEditors,
    updateState,
    fields,
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
        nestedEditors={nestedEditors}
      />,
      dom
    );

  return mount(name, fieldSpec, renderer, consumer, validate, defaultState);
};
