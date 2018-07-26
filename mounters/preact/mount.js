import { h, render } from 'preact';
import mount from '../../mount';
import EmbedProvider from './EmbedProvider';

export default mount(
  (consumer, validate, dom, updateState, fields, commands, updater) =>
    render(
      <EmbedProvider
        updater={updater}
        onStateChange={updateState}
        fields={fields}
        validate={validate}
        commands={commands}
      >
        {consumer}
      </EmbedProvider>,
      dom
    )
);
