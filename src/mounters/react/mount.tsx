import type { ReactElement } from "react";
import React from "react";
import { render } from "react-dom";
import { mount } from "../../mount";
import type { TRenderer, Validator } from "../../mount";
import type { NodeViewPropValues } from "../../nodeViews/helpers";
import type { TConsumer } from "../../types/Consumer";
import type { EmbedProps } from "../../types/Embed";
import { EmbedProvider } from "./EmbedProvider";

export const createReactEmbedRenderer = <
  Props extends EmbedProps<string>,
  Name extends string
>(
  name: Name,
  props: Props,
  consumer: TConsumer<ReactElement, Props>,
  validate: Validator<Props>,
  defaultState: NodeViewPropValues<Props>
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
