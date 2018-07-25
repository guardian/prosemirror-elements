import { h } from 'preact';
import preactMount from '../../mounters/preact/mount';
import ImageEmbed from './ImageEmbed';

const image = ({ editSrc = false } = {}) => preactMount((fields, updateFields) => (
  <ImageEmbed fields={fields} updateFields={updateFields} editSrc={editSrc} />
));

export default image;
