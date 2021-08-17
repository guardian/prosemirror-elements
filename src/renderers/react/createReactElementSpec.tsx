import type { ReactElement } from "react";
import React from "react";
import { render } from "react-dom";
import { createElementSpec } from "../../plugin/elementSpec";
import type { Renderer, Validator } from "../../plugin/elementSpec";
import type { Consumer } from "../../plugin/types/Consumer";
import type {
  FieldDescriptions,
  Transformers,
} from "../../plugin/types/Element";
import { ElementProvider } from "./ElementProvider";

export const createReactElementSpec = <
  FDesc extends FieldDescriptions<string>,
  ExternalData
>(
  FieldDescriptions: FDesc,
  consumer: Consumer<ReactElement, FDesc>,
  validate: Validator<FDesc>,
  transformers?: Transformers<FDesc, ExternalData>
) => {
  const renderer: Renderer<FDesc> = (
    validate,
    dom,
    fields,
    updateState,
    fieldValues,
    commands,
    subscribe
  ) =>
    render(
      <ElementProvider<FDesc>
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

  return createElementSpec(FieldDescriptions, renderer, validate, transformers);
};
