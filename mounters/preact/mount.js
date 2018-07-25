import { h, render } from 'preact';
import mount from '../../mount';
import EmbedProvider from './EmbedProvider';

export default mount((consumer, dom, updateState, fields, commands, updater) =>
  render(
    <EmbedProvider
      updater={updater}
      onStateChange={updateState}
      fields={fields}
      commands={commands}
    >
      {consumer}
    </EmbedProvider>,
    dom
  )
);
