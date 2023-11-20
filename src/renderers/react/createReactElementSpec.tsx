import type { ReactElement } from "react";
import React from "react";
import { createElementSpec } from "../../plugin/elementSpec";
import type { Renderer, Validator } from "../../plugin/elementSpec";
import type { Consumer } from "../../plugin/types/Consumer";
import type {
  ExtractFieldValues,
  FieldDescriptions,
} from "../../plugin/types/Element";
import { ElementProvider } from "./ElementProvider";

export const createReactElementSpec = <FDesc extends FieldDescriptions<string>>(
  fieldDescriptions: FDesc,
  consumer: Consumer<ReactElement | null, FDesc>,
  validate: Validator<FDesc> | undefined = undefined,
  onRemove?: (fields: ExtractFieldValues<FDesc>) => void
) => {
  const renderer: Renderer<FDesc> = (
    validate,
    root,
    fields,
    updateState,
    commands,
    subscribe,
    sendTelemetryEvent,
    getElementData
  ) =>
    root.render(
      <ElementProvider<FDesc>
        subscribe={subscribe}
        onStateChange={updateState}
        fields={fields}
        validate={validate}
        commands={commands}
        consumer={consumer}
        sendTelemetryEvent={sendTelemetryEvent}
        onRemove={() => onRemove?.(getElementData())}
      />
    );

  return createElementSpec(fieldDescriptions, renderer, validate);
};
