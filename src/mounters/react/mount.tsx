import type { ReactElement } from "react";
import React from "react";
import { render } from "react-dom";
import { mount } from "../../mount";
import { EmbedProvider } from "./EmbedProvider";

export const reactMount = mount<ReactElement>(
  (consumer, validate, dom, updateState, fields, commands, subscribe) =>
    render(
      <EmbedProvider
        subscribe={subscribe}
        onStateChange={updateState}
        fields={fields}
        validate={validate}
        commands={commands}
        consumer={consumer}
      />,
      dom
    )
);
