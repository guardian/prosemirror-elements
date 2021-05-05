import type { ReactElement } from "react";
import React from "react";
import { render } from "react-dom";
import { mount } from "../../mount";
import type { TFields } from "../../types/Fields";
import { EmbedProvider } from "./EmbedProvider";

export const createReactRenderer = <FieldAttrs extends TFields>(
  defaultFields: FieldAttrs
) =>
  mount<FieldAttrs, ReactElement>(
    (
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
        <EmbedProvider
          subscribe={subscribe}
          onStateChange={updateState}
          defaultFields={defaultFields}
          fields={fields}
          validate={validate}
          commands={commands}
          consumer={consumer}
          nestedEditors={nestedEditors}
        />,
        dom
      )
  );
