import { h } from 'preact';

const ImageEmbed = ({ fields: { name }, updateFields }) => (
  <input
    type="text"
    value={name}
    onInput={e => updateFields({ name: e.target.value })}
  />
);

export default ImageEmbed;
