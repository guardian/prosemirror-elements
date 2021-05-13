import type { ReactElement } from "react";
import React from "react";
import { render } from "react-dom";
import { mount } from "../../mount";
import type { TRenderer } from "../../mount";
import type { TConsumer } from "../../types/Consumer";
import type { ElementProps } from "../../types/Embed";
import type { TFields } from "../../types/Fields";
import type { TValidator } from "../../types/Validator";
import { EmbedProvider } from "./EmbedProvider";

export const createReactEmbedRenderer = <
  Props extends ElementProps,
  Name extends string
>(
  name: Name,
  props: Props,
  consumer: TConsumer<ReactElement, Props>,
  validate: TValidator,
  defaultState: TFields
) => {
  const renderer: TRenderer<ReactElement, Props> = (
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
      <EmbedProvider<Props>
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

  return mount(name, props, renderer, consumer, validate, defaultState);
};
