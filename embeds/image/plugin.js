import { h } from 'preact';
import preactMount from '../../mounters/preact/mount';
import ImageEmbed from './ImageEmbed';

const image = (/* config */) => preactMount((fields, updateFields) => (
  <ImageEmbed fields={fields} updateFields={updateFields} />
));

export default image;
