import React, { ReactElement } from "react";
import { render } from "react-dom";
import applyMount from "../../mount";
import TEmbed from "../../types/Embed";
import TErrors from "../../types/Errors";
import TFields from "../../types/Fields";
import TValidator from "../../types/Validator";
import EmbedProvider from "./EmbedProvider";

export type CreateReactEmbed<FieldAttrs extends TFields> = (
  fields: FieldAttrs,
  errors: TErrors,
  updateFields: (fields: FieldAttrs) => void
) => ReactElement;

/**
 * Mount a react-based embed render function, creating an Embed that the plugin can render.
 */
const mount = <FieldAttrs extends TFields>(
 createEmbed: CreateReactEmbed<FieldAttrs>,
 validate: TValidator<TFields>,
 defaultFields: FieldAttrs
): TEmbed<FieldAttrs> => applyMount<ReactElement, FieldAttrs>(
  (dom, updateState, fields, commands, subscribe) =>
    render(
      <EmbedProvider
        subscribe={subscribe}
        onStateChange={(fields) => updateState(fields, !!validate(fields))}
        fields={{...defaultFields, ...fields}}
        validate={validate}
        commands={commands}
        createEmbed={createEmbed}
      />,
      dom
    )
);

export default mount;
