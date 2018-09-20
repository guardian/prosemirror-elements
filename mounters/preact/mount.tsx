import { h, render, VNode } from 'preact';
import mount from '../../mount';
import EmbedProvider from './EmbedProvider';

export default mount<VNode>(
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
