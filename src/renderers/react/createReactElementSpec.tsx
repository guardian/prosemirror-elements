import type { ReactElement } from "react";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { createElementSpec } from "../../plugin/elementSpec";
import type { Renderer, Validator } from "../../plugin/elementSpec";
import type { Consumer } from "../../plugin/types/Consumer";
import type { FieldDescriptions } from "../../plugin/types/Element";
import { ElementProvider } from "./ElementProvider";

export const createReactElementSpec = <FDesc extends FieldDescriptions<string>>(
  fieldDescriptions: FDesc,
  consumer: Consumer<ReactElement | null, FDesc>,
  validate: Validator<FDesc> | undefined = undefined,
  onRemove?: (fields: Record<string, unknown>) => void
) => {
  const renderer: Renderer<FDesc> = (
    validate,
    dom,
    fields,
    updateState,
    commands,
    subscribe,
    sendTelemetryEvent
  ) =>
    render(
      <ElementProvider<FDesc>
        subscribe={subscribe}
        onStateChange={updateState}
        fields={fields}
        validate={validate}
        commands={commands}
        consumer={consumer}
        sendTelemetryEvent={sendTelemetryEvent}
        onRemove={onRemove}
      />,
      dom
    );
  const destroy = (dom: HTMLElement) => {
    unmountComponentAtNode(dom);
  };

  return createElementSpec(fieldDescriptions, renderer, validate, destroy);
};
