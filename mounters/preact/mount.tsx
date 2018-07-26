import { h, render } from 'preact';
import mount from '../../mount';
import EmbedProvider from './EmbedProvider';

export default mount((consumer, dom, updateFields, fields, commands, updater) =>
  render(
    <EmbedProvider
      updater={updater}
      onStateChange={updateFields}
      fields={fields}
      commands={commands}
    >
      {consumer}
    </EmbedProvider>,
    dom
  )
);
