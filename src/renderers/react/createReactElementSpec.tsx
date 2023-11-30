import type { ReactElement } from "react";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { createElementSpec } from "../../plugin/elementSpec";
import type { Renderer, Validator } from "../../plugin/elementSpec";
import type { Consumer } from "../../plugin/types/Consumer";
import type {
  ExtractFieldValues,
  FieldDescriptions,
} from "../../plugin/types/Element";
import { ElementProvider } from "./ElementProvider";
import type { ElementWrapperProps } from "./ElementWrapper";
import { ElementWrapper } from "./ElementWrapper";

type CreateReactElementSpecOptions<FDesc extends FieldDescriptions<string>> = {
  fieldDescriptions: FDesc;
  component: Consumer<ReactElement | null, FDesc>;
  validate?: Validator<FDesc> | undefined;
  onRemove?: (fields: ExtractFieldValues<FDesc>) => void;
  wrapperComponent?: React.FunctionComponent<ElementWrapperProps>;
};

export const createReactElementSpec = <
  FDesc extends FieldDescriptions<string>
>({
  fieldDescriptions,
  component,
  validate = undefined,
  onRemove,
  wrapperComponent = ElementWrapper,
}: CreateReactElementSpecOptions<FDesc>) => {
  const renderer: Renderer<FDesc> = (
    validate,
    dom,
    fields,
    updateState,
    commands,
    subscribe,
    sendTelemetryEvent,
    getElementData
  ) =>
    render(
      <ElementProvider<FDesc>
        subscribe={subscribe}
        onStateChange={updateState}
        fields={fields}
        validate={validate}
        commands={commands}
        component={component}
        sendTelemetryEvent={sendTelemetryEvent}
        onRemove={() => onRemove?.(getElementData())}
        wrapperComponent={wrapperComponent}
      />,
      dom
    );
  const destroy = (dom: HTMLElement) => {
    unmountComponentAtNode(dom);
  };

  return createElementSpec(fieldDescriptions, renderer, validate, destroy);
};
