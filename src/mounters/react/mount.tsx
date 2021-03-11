import React, { ReactElement } from "react";
import { render } from "react-dom";
import mount from "../../mount";
import EmbedProvider from "./EmbedProvider";

export default mount<ReactElement>(
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
