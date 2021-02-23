import { ReactNode } from "react";
import React from "react";
import { render } from "react-dom";
import mount from "../../mount";
import EmbedProvider from "./EmbedProvider";

export default mount<ReactNode>(
  (
    consumer,
    validate,
    dom,
    contentDOM,
    updateState,
    fields,
    commands,
    subscribe
  ) => {
    console.log('mounting ')
    render(
      <EmbedProvider
        subscribe={subscribe}
        onStateChange={updateState}
        fields={fields}
        validate={validate}
        commands={commands}
        consumer={consumer}
        contentDOM={contentDOM}
      />,
      dom
    );
  }
);
